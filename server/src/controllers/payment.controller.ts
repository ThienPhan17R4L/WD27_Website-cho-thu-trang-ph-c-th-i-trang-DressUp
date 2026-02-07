import { Request, Response } from "express";
import { MoMoService } from "../services/momo.service";
import { OrderService } from "../services/order.service";
import { OrderModel } from "../models/Order";
import { env } from "../config/env";

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

      // Create MoMo payment
      const payment = await MoMoService.createPayment({
        orderId: order.orderNumber,
        amount: order.total,
        orderInfo: `DressUp Order ${order.orderNumber}`,
        returnUrl: `${clientUrl}/orders`, // Redirect to orders page after payment
        notifyUrl: `${apiUrl}/payment/momo/callback`, // IPN callback
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
   */
  async momoCallback(req: Request, res: Response) {
    try {
      const data = req.body;

      console.log("[Payment] MoMo callback received:", data);

      // Verify signature
      const isValid = MoMoService.verifySignature(data, data.signature);
      if (!isValid) {
        console.error("[Payment] Invalid MoMo signature");
        return res.status(400).json({ message: "Invalid signature" });
      }

      // Handle callback
      const result = await MoMoService.handleCallback(data);

      if (result.success) {
        // Find order by orderNumber
        const order = await OrderModel.findOne({ orderNumber: result.orderId });

        if (order) {
          // Update payment status
          order.paymentStatus = "paid";
          if (result.transId) {
            order.paymentDetails = {
              transId: result.transId,
              paidAt: new Date(),
            };
          }
          await order.save();

          console.log(`[Payment] Order ${order.orderNumber} marked as paid`);
        } else {
          console.error(`[Payment] Order ${result.orderId} not found`);
        }
      }

      // Always return OK to MoMo
      res.json({ message: "OK" });
    } catch (error: any) {
      console.error("[Payment] MoMo callback error:", error);
      // Still return OK to prevent MoMo from retrying
      res.json({ message: "OK" });
    }
  },

  /**
   * GET /payment/momo/test/:orderId
   * Test endpoint to simulate successful MoMo payment (DEV ONLY)
   */
  async testMoMoSuccess(req: Request, res: Response) {
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

      // Simulate successful callback
      const mockCallback = MoMoService.mockSuccessCallback(orderId);
      mockCallback.amount = order.total;

      // Process callback
      const result = await MoMoService.handleCallback(mockCallback);

      if (result.success) {
        // Update order payment status
        await OrderModel.updateOne(
          { orderNumber: orderId },
          {
            paymentStatus: "paid",
            paymentDetails: {
              transId: result.transId,
              paidAt: new Date(),
              testMode: true,
            },
          }
        );
      }

      res.json({
        message: "Test payment successful",
        order: {
          orderNumber: order.orderNumber,
          paymentStatus: "paid",
        },
      });
    } catch (error: any) {
      console.error("[Payment] Test error:", error);
      res.status(500).json({ message: error.message });
    }
  },
};
