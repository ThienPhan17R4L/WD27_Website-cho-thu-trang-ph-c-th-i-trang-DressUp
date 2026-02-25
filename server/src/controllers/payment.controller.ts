import { Request, Response } from "express";
import { MoMoService } from "../services/momo.service";
import { OrderService } from "../services/order.service";
import { availabilityService } from "../services/availability.service";
import { OrderModel } from "../models/Order";
import { env } from "../config/env";

/**
 * MoMo Result Codes:
 * 0: Success
 * 9000: Transaction confirmed successfully
 * 8000: Transaction pending
 * 1000: Transaction initialized
 * 1001: Transaction processing
 * 1006: Transaction canceled
 * Others: Failed (timeout, insufficient balance, invalid card, etc.)
 */
const MOMO_RESULT_CODES = {
  SUCCESS: 0,
  CONFIRMED: 9000,
  PENDING: 8000,
  INITIALIZED: 1000,
  PROCESSING: 1001,
  CANCELED: 1006,
} as const;

export const PaymentController = {
  /**
   * POST /payment/momo/create
   * Create MoMo payment for an order
   */
  async createMoMoPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
      const userId = (req as any).user!.id;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      // Get order and verify ownership
      const order = await OrderService.getOrderById(orderId, userId);

      if (order.paymentMethod !== "momo") {
        return res.status(400).json({ message: "Order payment method is not MoMo" });
      }

      if (order.paymentStatus === "paid") {
        return res.status(400).json({ message: "Order already paid" });
      }

      // Get URLs from env
      const clientUrl = env.APP_ORIGIN; // Client URL (e.g., http://localhost:5173)
      const apiUrl = env.API_BASE_URL || `http://localhost:${env.PORT}`; // API URL

      // Create MoMo payment (including deposit for online payment)
      const totalAmount = order.total + (order.totalDeposit || 0);
      const payment = await MoMoService.createPayment({
        orderId: order.orderNumber,
        amount: totalAmount,
        orderInfo: `DressUp Order ${order.orderNumber}`,
        returnUrl: `${clientUrl}/payment/momo/return`, // Redirect to return handler page
        notifyUrl: `${apiUrl}/payment/momo/callback`, // IPN callback
      });

      // Store requestId in order for future reference
      await OrderModel.findByIdAndUpdate(orderId, {
        $set: {
          "paymentDetails.requestId": payment.requestId || `${order.orderNumber}_${Date.now()}`,
          "paymentDetails.momo.orderId": order.orderNumber,
          "paymentDetails.momo.amount": totalAmount,
        },
      });

      res.json(payment);
    } catch (error: any) {
      console.error("[Payment] MoMo create error:", error);
      res.status(500).json({ message: error.message || "Failed to create MoMo payment" });
    }
  },

  /**
   * POST /payment/momo/callback
   * Handle MoMo IPN callback (webhook)
   * This is called by MoMo server, not by client
   */
  async momoCallback(req: Request, res: Response) {
    try {
      const data = req.body;

      console.log("=".repeat(80));
      console.log("[Payment] ✉️  MoMo IPN CALLBACK RECEIVED");
      console.log("=".repeat(80));
      console.log("[Payment] Full payload:", JSON.stringify(data, null, 2));
      console.log("[Payment] Key fields:", {
        orderId: data.orderId,
        resultCode: data.resultCode,
        message: data.message,
        transId: data.transId,
        amount: data.amount,
      });

      // Verify signature
      const isValid = MoMoService.verifySignature(data);
      if (!isValid) {
        console.error("[Payment] Invalid MoMo signature");
        return res.status(400).json({ message: "Invalid signature" });
      }

      // Find order by orderNumber
      console.log(`[Payment] 🔍 Looking for order with orderNumber: ${data.orderId}`);
      const order = await OrderModel.findOne({ orderNumber: data.orderId });

      if (!order) {
        console.error(`[Payment] ❌ Order ${data.orderId} NOT FOUND in database`);
        console.error(`[Payment] This could mean:`);
        console.error(`  1. OrderNumber mismatch between MoMo and DB`);
        console.error(`  2. Order was deleted`);
        console.error(`  3. Wrong database connection`);
        // Still return OK to prevent MoMo from retrying
        return res.json({ message: "OK" });
      }

      console.log(`[Payment] ✓ Found order:`, {
        _id: order._id,
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        paymentStatus: order.paymentStatus,
      });

      // Handle different result codes
      const resultCode = Number(data.resultCode);

      if (resultCode === MOMO_RESULT_CODES.SUCCESS || resultCode === MOMO_RESULT_CODES.CONFIRMED) {
        // Payment successful
        console.log(`[Payment] 💰 Processing SUCCESSFUL payment (resultCode: ${resultCode})`);
        const previousStatus = order.status; // capture before mutating
        order.paymentStatus = "paid";
        order.status = "confirmed"; // Auto-confirm order after successful payment
        order.paymentDetails = {
          ...order.paymentDetails,
          transId: data.transId,
          requestId: data.requestId,
          paidAt: new Date(),
          momo: {
            transId: data.transId,
            requestId: data.requestId,
            orderId: data.orderId,
            amount: Number(data.amount),
            resultCode: data.resultCode,
            message: data.message,
            payType: data.payType,
            responseTime: data.responseTime,
            extraData: data.extraData,
          },
          rawCallback: data,
        };
        order.confirmedAt = new Date();

        // Add status history if not already confirmed (prevent duplicate IPN entries)
        if (previousStatus !== "confirmed") {
          order.statusHistory.push({
            status: "confirmed",
            timestamp: new Date(),
            notes: `Thanh toán MoMo thành công (TransID: ${data.transId})`,
          } as any);
        }

        await order.save();
        // Confirm rental reservations now that payment is complete
        await availabilityService.confirmByOrder(String(order._id));
        console.log(`[Payment] ✅ Order ${order.orderNumber} SAVED with status: ${order.status}, payment: ${order.paymentStatus}`);
        console.log(`[Payment] ✓ Payment successful - TransID: ${data.transId}`);
      } else if (resultCode === MOMO_RESULT_CODES.PENDING || resultCode === MOMO_RESULT_CODES.PROCESSING) {
        // Payment pending/processing - do not update status yet
        console.log(`[Payment] ⏳ Payment PENDING (resultCode: ${resultCode})`);

        // Store callback data for reference
        order.paymentDetails = {
          ...order.paymentDetails,
          momo: {
            ...(order.paymentDetails?.momo || {}),
            transId: data.transId,
            requestId: data.requestId,
            orderId: data.orderId,
            amount: Number(data.amount),
            resultCode: data.resultCode,
            message: data.message,
            payType: data.payType,
            responseTime: data.responseTime,
            extraData: data.extraData,
          },
          rawCallback: data,
        };
        await order.save();
        console.log(`[Payment] ⏳ Order ${order.orderNumber} saved with pending callback data`);
      } else {
        // Payment failed or canceled
        console.log(`[Payment] ❌ Payment FAILED (resultCode: ${resultCode}, message: ${data.message})`);
        order.paymentStatus = "failed";
        order.paymentDetails = {
          ...order.paymentDetails,
          failedAt: new Date(),
          momo: {
            transId: data.transId || "",
            requestId: data.requestId,
            orderId: data.orderId,
            amount: Number(data.amount),
            resultCode: data.resultCode,
            message: data.message,
            payType: data.payType || "",
            responseTime: data.responseTime,
            extraData: data.extraData || "",
          },
          rawCallback: data,
        };

        await order.save();
        // Release any reservations held for this order
        await availabilityService.releaseByOrder(String(order._id));
        console.log(`[Payment] ✗ Order ${order.orderNumber} saved as FAILED`);
      }

      console.log("=".repeat(80));
      console.log("[Payment] 📤 Sending OK response to MoMo");
      console.log("=".repeat(80));

      // Always return OK to MoMo to prevent retries
      res.json({ message: "OK" });
    } catch (error: any) {
      console.error("=".repeat(80));
      console.error("[Payment] 🔥 CALLBACK ERROR:", error);
      console.error("=".repeat(80));
      console.error(error.stack);
      // Still return OK to prevent MoMo from retrying
      res.json({ message: "OK" });
    }
  },

  /**
   * GET /payment/mock/:orderId
   * Get order details for mock payment page
   */
  async getMockPayment(req: Request, res: Response) {
    try {
      const orderId = String(req.params.orderId);
      const userId = (req as any).user!.id;

      const order = await OrderService.getOrderById(orderId, userId);

      res.json(order);
    } catch (error: any) {
      console.error("[Payment] Mock payment get error:", error);
      res.status(500).json({ message: error.message || "Failed to get order" });
    }
  },

  /**
   * POST /payment/mock/:orderId/success
   * Complete mock payment (success)
   * MOCK VERSION - Simulates full MoMo callback flow for testing
   */
  async completeMockPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user!.id;

      const order = await OrderModel.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify ownership
      if (order.userId.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // ========================================
      // OLD SIMPLE MOCK (kept for reference):
      // ========================================
      // order.paymentStatus = "paid";
      // order.status = "confirmed";
      // order.paymentDetails = {
      //   transId: `MOCK_${Date.now()}`,
      //   paidAt: new Date(),
      // };
      // await order.save();

      // ========================================
      // NEW FULL MOCK - Simulates MoMo callback
      // Mimics the exact flow in momoCallback() (lines 133-167)
      // ========================================

      // Generate mock MoMo transaction data (similar to real MoMo callback)
      const mockTransId = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10-digit number
      const mockRequestId = order.paymentDetails?.requestId || `${order.orderNumber}_${Date.now()}`;
      const totalAmount = order.total + (order.totalDeposit || 0);

      // Simulate successful MoMo payment callback (same as resultCode 0 or 9000)
      const mockPreviousStatus = order.status; // capture before mutating
      order.paymentStatus = "paid";
      order.status = "confirmed"; // Auto-confirm order after successful payment
      order.paymentDetails = {
        ...order.paymentDetails,
        transId: mockTransId,
        requestId: mockRequestId,
        paidAt: new Date(),
        momo: {
          transId: mockTransId,
          requestId: mockRequestId,
          orderId: order.orderNumber,
          amount: totalAmount,
          resultCode: 0, // 0 = Success (same as real MoMo)
          message: "Successful.", // Mock success message
          payType: "qr", // Mock payment type (qr/webApp/credit)
          responseTime: Date.now(),
          extraData: "", // Mock extra data
        },
        rawCallback: {
          // Mock raw callback data (for future refund reference)
          partnerCode: "MOCK_PARTNER",
          orderId: order.orderNumber,
          requestId: mockRequestId,
          amount: totalAmount,
          orderInfo: `DressUp Order ${order.orderNumber}`,
          orderType: "momo_wallet",
          transId: mockTransId,
          resultCode: 0,
          message: "Successful.",
          payType: "qr",
          responseTime: Date.now(),
          extraData: "",
          signature: "MOCK_SIGNATURE", // Mock signature
        },
      };
      order.confirmedAt = new Date();

      // Add status history if not already confirmed (prevent duplicate entries)
      if (mockPreviousStatus !== "confirmed") {
        order.statusHistory.push({
          status: "confirmed",
          timestamp: new Date(),
          notes: `Thanh toán MoMo thành công (Mock TransID: ${mockTransId})`,
        } as any);
      }

      await order.save();
      // Confirm rental reservations now that payment is complete
      await availabilityService.confirmByOrder(String(order._id));

      console.log(`[Payment] ✅ MOCK payment completed for order ${order.orderNumber}`);
      console.log(`[Payment] MOCK TransID: ${mockTransId}`);
      console.log(`[Payment] Order status: ${order.status}, payment: ${order.paymentStatus}`);

      res.json({ success: true, order });
    } catch (error: any) {
      console.error("[Payment] Mock payment complete error:", error);
      res.status(500).json({ message: error.message || "Failed to complete payment" });
    }
  },

  /**
   * POST /payment/mock/:orderId/fail
   * Fail mock payment
   * MOCK VERSION - Simulates MoMo payment failure
   */
  async failMockPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user!.id;

      const order = await OrderModel.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify ownership
      if (order.userId.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // ========================================
      // OLD SIMPLE MOCK (kept for reference):
      // ========================================
      // order.paymentStatus = "failed";
      // order.status = "cancelled";
      // await order.save();

      // ========================================
      // NEW FULL MOCK - Simulates MoMo failed callback
      // Mimics the exact flow in momoCallback() for failed payment (lines 192-214)
      // ========================================

      // Generate mock MoMo failure data
      const mockTransId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const mockRequestId = order.paymentDetails?.requestId || `${order.orderNumber}_${Date.now()}`;
      const totalAmount = order.total + (order.totalDeposit || 0);

      // Simulate failed MoMo payment (resultCode 1006 = canceled, or 7 = timeout)
      order.paymentStatus = "failed";
      order.paymentDetails = {
        ...order.paymentDetails,
        failedAt: new Date(),
        momo: {
          transId: mockTransId,
          requestId: mockRequestId,
          orderId: order.orderNumber,
          amount: totalAmount,
          resultCode: 1006, // 1006 = Transaction canceled
          message: "Transaction is canceled.",
          payType: "qr",
          responseTime: Date.now(),
          extraData: "",
        },
        rawCallback: {
          // Mock raw callback data
          partnerCode: "MOCK_PARTNER",
          orderId: order.orderNumber,
          requestId: mockRequestId,
          amount: totalAmount,
          orderInfo: `DressUp Order ${order.orderNumber}`,
          orderType: "momo_wallet",
          transId: mockTransId,
          resultCode: 1006,
          message: "Transaction is canceled.",
          payType: "qr",
          responseTime: Date.now(),
          extraData: "",
          signature: "MOCK_SIGNATURE",
        },
      };

      await order.save();
      // Release any reservations held for this order
      await availabilityService.releaseByOrder(String(order._id));

      console.log(`[Payment] ❌ MOCK payment failed for order ${order.orderNumber}`);
      console.log(`[Payment] MOCK TransID: ${mockTransId}, ResultCode: 1006 (Canceled)`);

      res.json({ success: false, order });
    } catch (error: any) {
      console.error("[Payment] Mock payment fail error:", error);
      res.status(500).json({ message: error.message || "Failed to process payment" });
    }
  },

  /**
   * GET /payment/momo/test/:orderId
   * Test endpoint to check transaction status (DEV ONLY)
   */
  async checkMoMoStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      // Type guard for orderId
      if (typeof orderId !== "string") {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      // Find order
      const order = await OrderModel.findOne({ orderNumber: orderId });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Get requestId from payment details or generate one
      const requestId = order.paymentDetails?.requestId || `${orderId}_${Date.now()}`;

      // Check transaction status via MoMo API
      const status = await MoMoService.checkTransactionStatus(orderId, requestId);

      res.json({
        message: "Transaction status retrieved",
        status,
        order: {
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
        },
      });
    } catch (error: any) {
      console.error("[Payment] Status check error:", error);
      res.status(500).json({ message: error.message });
    }
  },
};
