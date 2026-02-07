import { OrderModel } from "../models/Order";
import { InventoryService } from "../services/inventory.service";

/**
 * Auto-cancel COD orders that have passed their pickup deadline
 * Runs every 10 minutes
 */
export async function cancelExpiredCODOrders() {
  try {
    const now = new Date();

    // Find COD orders that are still pending and past pickup deadline
    const expiredOrders = await OrderModel.find({
      paymentMethod: "cod",
      status: "pending",
      pickupDeadline: { $exists: true, $lt: now },
    });

    if (expiredOrders.length === 0) {
      return 0;
    }

    // Cancel each expired order and release inventory
    for (const order of expiredOrders) {
      // Update order status
      order.status = "cancelled";
      await order.save();

      console.log(`[CRON] Auto-cancelled expired COD order ${order.orderNumber}`);

      // Release inventory for each item
      for (const item of order.items) {
        try {
          await InventoryService.releaseStock(
            item.productId.toString(),
            item.variant?.size || "",
            item.variant?.color,
            item.quantity
          );
          console.log(
            `[CRON] Released inventory for ${item.name} (${item.variant?.size}) x${item.quantity}`
          );
        } catch (error) {
          console.error(
            `[CRON] Failed to release inventory for order ${order.orderNumber}:`,
            error
          );
        }
      }
    }

    return expiredOrders.length;
  } catch (error) {
    console.error("[CRON] Error in cancelExpiredCODOrders:", error);
    return 0;
  }
}
