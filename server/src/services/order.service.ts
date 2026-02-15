import { OrderModel, type OrderDoc, type PaymentMethod } from "../models/Order";
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
    }
  ) {
    // 1. Get cart
    const cart = await CartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestError("EMPTY_CART", "Cart is empty");
    }

    // 2. Check availability for all items (time-based)
    for (const item of cart.items!) {
      if (!item.variant?.size) {
        throw new BadRequestError(
          "INVALID_ITEM",
          `Product ${item.name} is missing size information`
        );
      }

      const startDate = new Date(item.rental.startDate);
      const endDate = new Date(item.rental.endDate);

      const { available } = await availabilityService.checkAvailability(
        item.productId.toString(),
        item.variant.size,
        item.variant?.color,
        startDate,
        endDate,
        item.quantity
      );

      if (!available) {
        throw new BadRequestError(
          "NOT_AVAILABLE",
          `Product ${item.name} (${item.variant.size}) is not available for the selected dates`
        );
      }
    }

    // 3. Calculate totals
    const subtotal = cart.totals?.subtotal || 0;
    const discount = cart.totals?.discount || 0;
    const shippingFee = cart.totals?.shippingFee || 0;

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
    const totalDeposit = cart.items!.reduce(
      (sum, item) => sum + (item.deposit || 0) * item.quantity,
      0
    );

    // 3.4 Calculate pickup deadline for COD orders (2 hours from now)
    let pickupDeadline: Date | undefined;
    if (payload.paymentMethod === "cod") {
      pickupDeadline = new Date();
      pickupDeadline.setHours(pickupDeadline.getHours() + 2);
    }

    // 4. Create order
    const orderData: any = {
      userId,
      orderNumber: generateOrderNumber(),
      items: cart.items.map((item: any) => ({
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
      shippingAddress: payload.shippingAddress,
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
    for (const item of cart.items!) {
      if (item.variant?.size) {
        try {
          const reservation = await availabilityService.createHold(
            userId,
            item.productId.toString(),
            item.variant.size,
            item.variant?.color,
            new Date(item.rental.startDate),
            new Date(item.rental.endDate),
            item.quantity
          );
          // Confirm hold immediately and link to order
          await availabilityService.confirmReservation(
            String(reservation._id),
            String(order._id)
          );
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

  async getOrders(
    userId: string,
    filters?: { status?: string; page?: number; limit?: number }
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (filters?.status) {
      query.status = filters.status;
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
      query.status = filters.status;
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
  async deliverOrder(orderId: string, userId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    // Verify ownership
    if (String(order.userId) !== userId) {
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

  /** Cancel order (from pending/confirmed/picking) */
  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    await transitionStatus(order, "cancelled", userId, reason);

    // Release reservations
    await availabilityService.releaseByOrder(String(order._id));

    // Release inventory
    for (const item of order.items) {
      if (item.variant?.size) {
        await InventoryService.releaseStock(
          item.productId.toString(),
          item.variant.size,
          item.variant?.color,
          item.quantity
        );
      }
    }

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
};
