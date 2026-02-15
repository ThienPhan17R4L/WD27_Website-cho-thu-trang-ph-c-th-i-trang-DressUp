import { ReturnModel } from "../models/Return";
import { OrderModel } from "../models/Order";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { auditService } from "./audit.service";
import { env } from "../config/env";

export const returnService = {
  async initiateReturn(
    orderId: string,
    userId: string,
    data: { returnMethod: "in_store" | "shipping"; trackingNumber?: string }
  ) {
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "Order not found");

    const validStatuses = ["active_rental", "overdue", "delivered"];
    if (!validStatuses.includes(order.status)) {
      throw new BadRequestError("INVALID_STATUS", `Cannot return order with status: ${order.status}`);
    }

    // Create return record with items from order
    const items = order.items.map((item: any, index: number) => ({
      orderItemIndex: index,
      productId: item.productId,
      variantKey: item.variant || {},
      conditionBefore: "new",
      conditionAfter: "new",
      damageFee: 0,
    }));

    const returnDoc = await ReturnModel.create({
      orderId,
      userId,
      returnMethod: data.returnMethod,
      trackingNumber: data.trackingNumber,
      items,
    } as any);

    // Update order status
    order.status = "returned" as any;
    (order as any).returnedAt = new Date();
    if (!order.statusHistory) (order as any).statusHistory = [];
    (order as any).statusHistory.push({
      status: "returned",
      timestamp: new Date(),
      changedBy: userId,
    });
    await order.save();

    await auditService.log("Order", orderId, "status_change", userId, [
      { field: "status", oldValue: order.status, newValue: "returned" },
    ]);

    return returnDoc;
  },

  async inspectReturn(
    returnId: string,
    staffId: string,
    inspectionData: Array<{
      orderItemIndex: number;
      conditionAfter: string;
      damageNotes?: string;
      damageFee: number;
    }>
  ) {
    const returnDoc = await ReturnModel.findById(returnId);
    if (!returnDoc) throw new NotFoundError("RETURN_NOT_FOUND", "Return not found");

    if (returnDoc.status !== "pending_inspection") {
      throw new BadRequestError("ALREADY_INSPECTED", "Return already inspected");
    }

    let totalDamageFee = 0;
    for (const inspection of inspectionData) {
      const item = returnDoc.items.find((i) => i.orderItemIndex === inspection.orderItemIndex);
      if (item) {
        item.conditionAfter = inspection.conditionAfter;
        item.damageNotes = inspection.damageNotes ?? "";
        item.damageFee = inspection.damageFee;
        totalDamageFee += inspection.damageFee;
      }
    }

    // Calculate late fee
    const order = await OrderModel.findById(returnDoc.orderId);
    let lateFee = 0;
    if (order) {
      for (const item of order.items) {
        const rental = (item as any).rental;
        if (rental && rental.endDate && new Date() > new Date(rental.endDate)) {
          const overdueDays = Math.ceil(
            (Date.now() - new Date(rental.endDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          lateFee += overdueDays * (rental.pricePerDay || 0) * env.LATE_FEE_MULTIPLIER;
        }
      }
    }

    // Calculate deposit refund
    const totalDeposit = order ? (order as any).totalDeposit || 0 : 0;
    const depositRefundAmount = Math.max(0, totalDeposit - totalDamageFee - lateFee);

    returnDoc.totalDamageFee = totalDamageFee;
    returnDoc.lateFee = lateFee;
    returnDoc.depositRefundAmount = depositRefundAmount;
    returnDoc.status = "inspected";
    returnDoc.inspectedBy = staffId as any;
    returnDoc.inspectedAt = new Date();
    await returnDoc.save();

    // Update order status to inspecting
    if (order) {
      order.status = "inspecting" as any;
      if (!order.statusHistory) (order as any).statusHistory = [];
      (order as any).statusHistory.push({
        status: "inspecting",
        timestamp: new Date(),
        changedBy: staffId,
      });
      await order.save();
    }

    await auditService.log("Return", returnId, "inspection", staffId, [
      { field: "totalDamageFee", newValue: totalDamageFee },
      { field: "lateFee", newValue: lateFee },
      { field: "depositRefundAmount", newValue: depositRefundAmount },
    ]);

    return returnDoc;
  },

  async closeReturn(returnId: string, staffId: string) {
    const returnDoc = await ReturnModel.findById(returnId);
    if (!returnDoc) throw new NotFoundError("RETURN_NOT_FOUND", "Return not found");

    returnDoc.status = "closed";
    await returnDoc.save();

    // Complete the order
    const order = await OrderModel.findById(returnDoc.orderId);
    if (order) {
      order.status = "completed" as any;
      (order as any).depositRefunded = returnDoc.depositRefundAmount;
      (order as any).lateFee = returnDoc.lateFee;
      if (!order.statusHistory) (order as any).statusHistory = [];
      (order as any).statusHistory.push({
        status: "completed",
        timestamp: new Date(),
        changedBy: staffId,
      });
      await order.save();

      await auditService.log("Order", String(order._id), "status_change", staffId, [
        { field: "status", newValue: "completed" },
        { field: "depositRefunded", newValue: returnDoc.depositRefundAmount },
      ]);
    }

    return returnDoc;
  },

  async getById(returnId: string) {
    const returnDoc = await ReturnModel.findById(returnId);
    if (!returnDoc) throw new NotFoundError("RETURN_NOT_FOUND", "Return not found");
    return returnDoc;
  },

  async list(filters: { status?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;

    const [data, total] = await Promise.all([
      ReturnModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ReturnModel.countDocuments(query),
    ]);

    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  },
};
