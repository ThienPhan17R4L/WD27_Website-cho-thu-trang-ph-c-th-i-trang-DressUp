import { OrderModel } from "../models/Order";
import { notificationService } from "../services/notification.service";
import { auditService } from "../services/audit.service";
import { logger } from "../utils/logger";

/**
 * Detect active rentals that are past their end date and mark them as overdue.
 * Runs periodically via cron job.
 */
export async function detectOverdueRentals(): Promise<number> {
  try {
    const now = new Date();

    // Find orders that are active_rental (or legacy "renting"/"delivered")
    // where ALL rental end dates have passed
    const overdueOrders = await OrderModel.find({
      status: { $in: ["active_rental", "delivered", "renting"] },
      "items.rental.endDate": { $lt: now },
    });

    let count = 0;

    for (const order of overdueOrders) {
      // Check if at least one item is overdue
      const hasOverdueItem = order.items.some(
        (item) => new Date(item.rental.endDate) < now
      );

      if (!hasOverdueItem) continue;

      order.status = "overdue" as any;
      if (!order.statusHistory) (order as any).statusHistory = [];
      order.statusHistory.push({
        status: "overdue",
        timestamp: now,
        changedBy: "system",
        notes: "Auto-detected overdue rental",
      });
      await order.save();

      await auditService.log("Order", String(order._id), "status_change", "system", [
        { field: "status", oldValue: "active_rental", newValue: "overdue" },
      ]);

      await notificationService.notify(String(order.userId), "RENTAL_OVERDUE", {
        orderNumber: order.orderNumber,
        orderId: String(order._id),
      });

      count++;
    }

    return count;
  } catch (error) {
    logger.error("Failed to detect overdue rentals", {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}
