import { OrderModel, type OrderDoc, type PaymentMethod } from "../models/Order";
import { ReturnModel } from "../models/Return";
import { InventoryModel } from "../models/Inventory";
import { CartService } from "./cart.service";
import { InventoryService } from "./inventory.service";
import { availabilityService } from "./availability.service";
import { couponService } from "./coupon.service";
import { auditService } from "./audit.service";
import { notificationService } from "./notification.service";
import { assertTransition, normalizeStatus, type OrderStatus } from "../utils/orderStateMachine";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { env } from "../config/env";
import { logger } from "../utils/logger";

function generateOrderNumber(): string {
  const date = new Date();
  const yyyymmdd = date.toISOString().split("T")[0]!.replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `DU${yyyymmdd}${random}`;
}

/**
 * Transition order status with state machine validation + audit log
 */
async function transitionStatus(
  order: OrderDoc & { save: () => Promise<any> },
  newStatus: OrderStatus,
  changedBy: string,
  notes?: string
) {
  const currentStatus = normalizeStatus(order.status);
  assertTransition(currentStatus, newStatus);

  const oldStatus = order.status;
  order.status = newStatus;
  if (!order.statusHistory) (order as any).statusHistory = [];
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    changedBy,
    ...(notes != null ? { notes } : {}),
  } as any);
  await order.save();

  await auditService.log("Order", String(order._id), "status_change", changedBy, [
    { field: "status", oldValue: oldStatus, newValue: newStatus },
  ]);

  logger.info(`Order ${order.orderNumber} transitioned ${oldStatus} -> ${newStatus}`);
}

export const OrderService = {
  async createOrder(
    userId: string,
    payload: {
      shippingAddress: any;
      paymentMethod: PaymentMethod;
      notes?: string;
      couponCode?: string;
      itemIds?: string[];
    }
  ) {
    // 1. Get cart
    const cart = await CartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestError("EMPTY_CART", "Cart is empty");
    }

    // 1.1 If itemIds provided, filter to only selected items
    const orderItems = payload.itemIds && payload.itemIds.length > 0
      ? cart.items.filter((item: any) => payload.itemIds!.includes(item._id?.toString()))
      : cart.items;

    if (orderItems.length === 0) {
      throw new BadRequestError("EMPTY_SELECTION", "No items selected for checkout");
    }

    // 2. Check availability for all items (time-based)
    console.log('[Order] ========================================');
    console.log('[Order] CHECKING AVAILABILITY');
    console.log('[Order] ========================================');
    console.log('[Order] Cart items count:', orderItems.length);

    for (const item of orderItems) {
      console.log(`[Order] Checking item: ${item.name}`);
      console.log(`[Order]   - Product ID: ${item.productId}`);
      console.log(`[Order]   - Variant: ${item.variant?.size} ${item.variant?.color || ''}`);
      console.log(`[Order]   - Quantity: ${item.quantity}`);

      if (!item.variant?.size) {
        throw new BadRequestError(
          "INVALID_ITEM",
          `Product ${item.name} is missing size information`
        );
      }

      // Validate rental dates exist
      if (!item.rental?.startDate || !item.rental?.endDate) {
        console.log('[Order]   ❌ MISSING RENTAL DATES');
        throw new BadRequestError(
          "MISSING_RENTAL_DATES",
          `Product ${item.name} is missing rental dates. Please update the rental period in your cart before checkout.`
        );
      }

      const startDate = new Date(item.rental.startDate);
      const endDate = new Date(item.rental.endDate);
      console.log(`[Order]   - Rental: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

      const availResult = await availabilityService.checkAvailability(
        item.productId.toString(),
        item.variant.size,
        item.variant?.color,
        startDate,
        endDate,
        item.quantity
      );

      console.log(`[Order]   - Availability check result:`, availResult);

      if (!availResult.available) {
        console.log('[Order]   ❌ NOT AVAILABLE');
        throw new BadRequestError(
          "NOT_AVAILABLE",
          `Product ${item.name} (${item.variant.size}) is not available for the selected dates`
        );
      }

      console.log('[Order]   ✅ Available');
    }

    console.log('[Order] ✅ All items available');

    // 3. Calculate totals (from selected items only if partial checkout)
    const isPartialCheckout = payload.itemIds && payload.itemIds.length > 0;
    let subtotal: number;
    let discount: number;
    let shippingFee: number;

    if (isPartialCheckout) {
      subtotal = orderItems.reduce(
        (sum: number, item: any) => sum + (item.lineTotal ?? (item.rental?.price || 0) * (item.rental?.days || 1) * item.quantity),
        0
      );
      discount = 0;
      shippingFee = 0;
    } else {
      subtotal = cart.totals?.subtotal || 0;
      discount = cart.totals?.discount || 0;
      shippingFee = cart.totals?.shippingFee || 0;
    }

    // 3.1 Service fee
    const serviceFee = Math.round(subtotal * (env.SERVICE_FEE_PERCENT / 100));

    // 3.2 Apply coupon if provided
    let couponDiscount = 0;
    if (payload.couponCode) {
      const result = await couponService.validate(payload.couponCode, subtotal);
      couponDiscount = result.discount;
    }

    const total = Math.max(0, subtotal - discount - couponDiscount + shippingFee + serviceFee);

    // 3.3 Calculate total deposit
    const totalDeposit = orderItems.reduce(
      (sum: number, item: any) => sum + (item.deposit || 0) * item.quantity,
      0
    );

    // 3.4 Calculate pickup deadline for COD orders (2 hours from now)
    let pickupDeadline: Date | undefined;
    if (payload.paymentMethod === "cod") {
      pickupDeadline = new Date();
      pickupDeadline.setHours(pickupDeadline.getHours() + 2);
    }

    // 3.5 Validate shipping address (not required for in-store payment)
    if (payload.paymentMethod !== "store" && !payload.shippingAddress) {
      throw new BadRequestError("MISSING_ADDRESS", "Shipping address is required");
    }

    // 4. Create order
    const orderData: any = {
      userId,
      orderNumber: generateOrderNumber(),
      items: orderItems.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        rental: {
          startDate: item.rental.startDate,
          endDate: item.rental.endDate,
          days: item.rental.days,
          pricePerDay: item.rental.price,
        },
        variant: item.variant,
        deposit: item.deposit,
        quantity: item.quantity,
        lineTotal:
          item.lineTotal || item.rental.price * item.rental.days * item.quantity,
      })),
      ...(payload.shippingAddress ? { shippingAddress: payload.shippingAddress } : {}),
      subtotal,
      discount,
      shippingFee,
      serviceFee,
      couponCode: payload.couponCode,
      couponDiscount,
      totalDeposit,
      total,
      paymentMethod: payload.paymentMethod,
      paymentStatus: "pending",
      status: "pending_payment",
      statusHistory: [{
        status: "pending_payment",
        timestamp: new Date(),
        changedBy: userId,
        notes: "Order created",
      }],
      lateFee: 0,
      depositRefunded: 0,
    };

    if (payload.notes) {
      orderData.notes = payload.notes;
    }
    if (pickupDeadline) {
      orderData.pickupDeadline = pickupDeadline;
    }

    const order = await OrderModel.create(orderData);

    // 5. Create rental reservations (holds)
    const isCod = payload.paymentMethod === "cod";
    for (const item of cart.items!) {
      if (item.variant?.size) {
        try {
          await availabilityService.createHold(
            userId,
            item.productId.toString(),
            item.variant.size,
            item.variant?.color,
            new Date(item.rental.startDate),
            new Date(item.rental.endDate),
            item.quantity,
            String(order._id)
          );
          // COD: confirm immediately (no payment required, order is already placed)
          // Online payment: keep as "hold" with TTL → confirmed only after payment success
          if (isCod) {
            await availabilityService.confirmByOrder(String(order._id));
          }
        } catch {
          // Fallback: reserve via old inventory system
          await InventoryService.reserveStock(
            item.productId.toString(),
            item.variant.size,
            item.variant?.color,
            item.quantity
          );
        }
      }
    }

    // 6. Apply coupon usage if applicable
    if (payload.couponCode && couponDiscount > 0) {
      await couponService.applyCoupon(payload.couponCode);
    }

    // 7. Clear cart
    await CartService.clear(userId);

    // 8. Audit log
    await auditService.log("Order", String(order._id), "create", userId, [
      { field: "orderNumber", newValue: order.orderNumber },
      { field: "total", newValue: total },
      { field: "paymentMethod", newValue: payload.paymentMethod },
    ]);

    logger.info(`Order ${order.orderNumber} created by user ${userId}`);

    return order;
  },

  async getOrderById(orderId: string, userId: string) {
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");
    return order;
  },

  async getOrderByIdAdmin(orderId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");
    return order;
  },

  async getOrders(
    userId: string,
    filters?: { status?: string; page?: number; limit?: number }
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (filters?.status) {
      const statuses = filters.status.split(",").map((s) => s.trim()).filter(Boolean);
      query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }

    const [items, total] = await Promise.all([
      OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      OrderModel.countDocuments(query),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  async getAllOrders(filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters?.status) {
      const statuses = filters.status.split(",").map((s) => s.trim()).filter(Boolean);
      query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }

    const [items, total] = await Promise.all([
      OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      OrderModel.countDocuments(query),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  // -- State machine transitions --

  /** Admin confirms order: pending_payment → confirmed */
  async confirmOrder(orderId: string, adminId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    await transitionStatus(order, "confirmed", adminId);
    order.confirmedAt = new Date();
    await order.save();

    await notificationService.notify(String(order.userId), "ORDER_CONFIRMED", {
      orderNumber: order.orderNumber,
      orderId: String(order._id),
    });

    return order;
  },

  /** Staff picks order: confirmed → picking */
  async pickOrder(orderId: string, staffId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    await transitionStatus(order, "picking", staffId);
    return order;
  },

  /** Admin ships order: picking → shipping */
  async shipOrder(orderId: string, adminId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    await transitionStatus(order, "shipping", adminId);
    order.shippedAt = new Date();
    await order.save();

    await notificationService.notify(String(order.userId), "ORDER_SHIPPED", {
      orderNumber: order.orderNumber,
      orderId: String(order._id),
    });

    return order;
  },

  /** Customer confirms delivery: shipping → delivered */
  async deliverOrder(orderId: string, userId: string, skipOwnerCheck = false) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    // Verify ownership (skip for admin/staff)
    if (!skipOwnerCheck && String(order.userId) !== userId) {
      throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");
    }

    await transitionStatus(order, "delivered", userId);
    order.deliveredAt = new Date();
    await order.save();

    return order;
  },

  /** Activate rental: delivered → active_rental */
  async activateRental(orderId: string, userId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    await transitionStatus(order, "active_rental", userId);
    return order;
  },

  /**
   * COD direct: admin xác nhận thanh toán + kích hoạt thuê ngay tại shop
   * pending_payment → active_rental (bỏ qua shipping/delivered)
   */
  async activateCodRental(orderId: string, adminId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");
    if (order.paymentMethod !== "cod") {
      throw new BadRequestError("INVALID_PAYMENT_METHOD", "Chỉ áp dụng cho đơn COD (lấy tại shop)");
    }

    order.paymentStatus = "paid";
    order.confirmedAt = new Date();
    await order.save();

    await transitionStatus(order, "active_rental", adminId, "Khách đã thanh toán và nhận hàng tại shop");

    await notificationService.notify(String(order.userId), "ORDER_CONFIRMED", {
      orderNumber: order.orderNumber,
      orderId: String(order._id),
    });

    return order;
  },

  /** Cancel order (from pending/confirmed/picking) */
  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    await transitionStatus(order, "cancelled", userId, reason);

    // Release date-based reservations (RentalReservation system)
    await availabilityService.releaseByOrder(String(order._id));

    return order;
  },

  /** Legacy: update order status directly (deprecated, use specific methods) */
  async updateOrderStatus(orderId: string, status: string) {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");
    return order;
  },

  async updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: string,
    paymentDetails?: any
  ) {
    const updateData: any = { paymentStatus };
    if (paymentDetails) {
      updateData.paymentDetails = paymentDetails;
    }

    const order = await OrderModel.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");
    return order;
  },

  /** Calculate expected late fee for an order (preview) */
  async calculateLateFee(orderId: string): Promise<number> {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    const now = new Date();
    let lateFee = 0;

    for (const item of order.items) {
      const expectedReturnDate = new Date(item.rental.endDate);
      if (now > expectedReturnDate) {
        const daysLate = Math.ceil(
          (now.getTime() - expectedReturnDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        lateFee += item.rental.pricePerDay * daysLate * item.quantity * env.LATE_FEE_MULTIPLIER;
      }
    }

    return lateFee;
  },

  /** Get active rentals for a user */
  async getActiveRentals(userId: string) {
    return OrderModel.find({
      userId,
      status: { $in: ["delivered", "active_rental", "renting"] },
    })
      .populate("items.productId")
      .sort({ deliveredAt: -1 });
  },

  /** Mark order as returned — calculates late fee at time of return */
  async markReturned(orderId: string, staffId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    // Calculate late fee
    const now = new Date();
    let lateFee = 0;
    for (const item of order.items) {
      const expectedReturnDate = new Date(item.rental.endDate);
      if (now > expectedReturnDate) {
        const daysLate = Math.ceil(
          (now.getTime() - expectedReturnDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        lateFee += item.rental.pricePerDay * daysLate * item.quantity * env.LATE_FEE_MULTIPLIER;
      }
    }

    order.lateFee = lateFee;
    order.returnedAt = now;
    order.actualReturnDate = now;

    const notes = lateFee > 0
      ? `Trả muộn — phí phạt: ${lateFee.toLocaleString("vi-VN")} VND`
      : "Đã trả hàng đúng hạn";

    await transitionStatus(order, "returned", staffId, notes);
    await order.save();
    return order;
  },

  /** Start inspection — creates Return record */
  async startInspection(orderId: string, staffId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    // Create Return document if not exists
    const existing = await ReturnModel.findOne({ orderId });
    if (!existing) {
      await ReturnModel.create({
        orderId: order._id,
        userId: order.userId,
        returnMethod: "in_store",
        returnedAt: order.returnedAt || new Date(),
        status: "pending_inspection",
        items: [],
        totalDamageFee: 0,
        lateFee: order.lateFee || 0,
        depositRefundAmount: 0,
      });
    }

    await transitionStatus(order, "inspecting", staffId);
    await order.save();
    return order;
  },

  /** Complete inspection with damage assessment */
  async completeInspection(
    orderId: string,
    staffId: string,
    payload: {
      items: {
        orderItemIndex: number;
        conditionAfter: string;
        damageNotes?: string;
        damageFee: number;
      }[];
      notes?: string;
    }
  ) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    if (order.status !== "inspecting") {
      throw new BadRequestError("INVALID_STATUS", "Order must be in inspection first");
    }

    const totalDamageFee = payload.items.reduce((sum, item) => sum + (item.damageFee || 0), 0);
    const depositRefundAmount = Math.max(
      0,
      (order.totalDeposit || 0) - (order.lateFee || 0) - totalDamageFee
    );

    // Upsert Return document with inspection results
    const returnDoc = await ReturnModel.findOneAndUpdate(
      { orderId },
      {
        items: payload.items.map((item) => ({
          orderItemIndex: item.orderItemIndex,
          productId: order.items[item.orderItemIndex]?.productId,
          variantKey: order.items[item.orderItemIndex]?.variant || {},
          conditionBefore: "good",
          conditionAfter: item.conditionAfter,
          damageNotes: item.damageNotes,
          damageFee: item.damageFee || 0,
        })),
        totalDamageFee,
        depositRefundAmount,
        lateFee: order.lateFee || 0,
        status: "inspected",
        inspectedBy: staffId,
        inspectedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Update inventory based on damage assessment
    for (const item of payload.items) {
      const orderItem = order.items[item.orderItemIndex];
      if (!orderItem) continue;
      const qty = orderItem.quantity || 1;
      const productId = orderItem.productId?.toString();
      const size = orderItem.variant?.size;
      if (!productId || !size) continue;

      const inventory = await InventoryModel.findOne({
        productId,
        "variantKey.size": size,
        ...(orderItem.variant?.color ? { "variantKey.color": orderItem.variant.color } : {}),
      });
      if (!inventory) continue;

      if (item.conditionAfter === "destroyed") {
        // Permanently lost — mark as lost (do NOT return to available)
        inventory.qtyLost = Math.min(inventory.qtyLost + qty, inventory.qtyTotal);
        await inventory.save();
      } else if (item.conditionAfter.startsWith("damage_")) {
        // Damaged but repairable — move to repair queue
        inventory.qtyInRepair += qty;
        await inventory.save();
      }
      // "new" / "good" → item returns to available automatically when reservation lifts
    }

    order.depositRefunded = depositRefundAmount;
    order.inspectedAt = new Date();

    const inspectionNotes = payload.notes
      || `Hoàn cọc: ${depositRefundAmount.toLocaleString("vi-VN")} VND`
      + (totalDamageFee > 0 ? ` | Phí hư hại: ${totalDamageFee.toLocaleString("vi-VN")} VND` : "")
      + ((order.lateFee || 0) > 0 ? ` | Phí trễ hạn: ${order.lateFee!.toLocaleString("vi-VN")} VND` : "");

    await transitionStatus(order, "completed", staffId, inspectionNotes);
    await order.save();

    await notificationService.notify(String(order.userId), "RETURN_APPROVED", {
      orderNumber: order.orderNumber,
      orderId: String(order._id),
      lateFee: order.lateFee || 0,
      totalDamageFee,
      depositRefundAmount,
    });

    return { order, returnRecord: returnDoc };
  },

  /** Get return/inspection record for an order */
  async getReturnByOrder(orderId: string) {
    return ReturnModel.findOne({ orderId });
  },
};
