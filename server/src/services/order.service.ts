import { OrderModel, type OrderDoc, type PaymentMethod } from "../models/Order";
import { CartService } from "./cart.service";
import { InventoryService } from "./inventory.service";
import { BadRequestError, NotFoundError } from "../utils/errors";

function generateOrderNumber(): string {
  const date = new Date();
  const yyyymmdd = date.toISOString().split("T")[0]!.replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `DU${yyyymmdd}${random}`;
}

export const OrderService = {
  async createOrder(
    userId: string,
    payload: {
      shippingAddress: any;
      paymentMethod: PaymentMethod;
      notes?: string;
    }
  ) {
    // 1. Get cart
    const cart = await CartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestError("EMPTY_CART", "Cart is empty");
    }

    // 2. Check inventory for all items
    for (const item of cart.items!) {
      if (!item.variant?.size) {
        throw new BadRequestError(
          "INVALID_ITEM",
          `Product ${item.name} is missing size information`
        );
      }

      const available = await InventoryService.checkAvailability(
        item.productId.toString(),
        item.variant.size,
        item.variant?.color,
        item.quantity
      );

      if (!available) {
        throw new BadRequestError(
          "OUT_OF_STOCK",
          `Product ${item.name} (${item.variant.size}) is out of stock`
        );
      }
    }

    // 3. Calculate totals (đã có trong cart response)
    const subtotal = cart.totals?.subtotal || 0;
    const discount = cart.totals?.discount || 0;
    const shippingFee = cart.totals?.shippingFee || 0;
    const total = cart.totals?.grandTotal || 0;

    // 3.5. Calculate total deposit
    const totalDeposit = cart.items!.reduce(
      (sum, item) => sum + (item.deposit || 0) * item.quantity,
      0
    );

    // 3.6. Calculate pickup deadline for COD orders (2 hours from now)
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
      totalDeposit,
      total,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentMethod === "cod" ? "pending" : "pending",
      status: "pending",
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

    // 5. Reserve inventory (decrease qtyAvailable)
    for (const item of cart.items!) {
      if (item.variant?.size) {
        await InventoryService.reserveStock(
          item.productId.toString(),
          item.variant.size,
          item.variant?.color,
          item.quantity
        );
      }
    }

    // 6. Clear cart
    await CartService.clear(userId);

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

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

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

  /**
   * Status transitions for order flow
   */

  // Admin confirms order (pending → confirmed)
  async confirmOrder(orderId: string) {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status: "confirmed",
        confirmedAt: new Date(),
      },
      { new: true }
    );
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");
    return order;
  },

  // Admin ships order (confirmed → shipping)
  async shipOrder(orderId: string) {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status: "shipping",
        shippedAt: new Date(),
      },
      { new: true }
    );
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");
    return order;
  },

  // Customer receives order (shipping → delivered)
  async deliverOrder(orderId: string) {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status: "delivered",
        deliveredAt: new Date(),
      },
      { new: true }
    );
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");
    return order;
  },

  // Customer returns items and completes rental (delivered/renting → completed)
  async completeOrder(orderId: string, actualReturnDate?: Date) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    const returnDate = actualReturnDate || new Date();
    let lateFee = 0;

    // Calculate late fee if returned after rental end date
    for (const item of order.items) {
      const expectedReturnDate = new Date(item.rental.endDate);
      if (returnDate > expectedReturnDate) {
        const daysLate = Math.ceil(
          (returnDate.getTime() - expectedReturnDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        // Late fee = pricePerDay * days late * quantity * 1.5 (penalty multiplier)
        lateFee += item.rental.pricePerDay * daysLate * item.quantity * 1.5;
      }
    }

    order.status = "completed";
    order.actualReturnDate = returnDate;
    order.lateFee = lateFee;
    await order.save();

    return order;
  },

  // Calculate expected late fee for an order (preview)
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
        lateFee += item.rental.pricePerDay * daysLate * item.quantity * 1.5;
      }
    }

    return lateFee;
  },
};
