import { cancelExpiredCODOrders } from "./cancelExpiredOrders";
import { detectOverdueRentals } from "./detectOverdueRentals";
import { logger } from "../utils/logger";

/**
 * Start all cron jobs
 * - Cancel expired COD orders: every 10 minutes
 * - Detect overdue rentals: every 30 minutes
 */
export function startCronJobs() {
  logger.info("Starting cron jobs...");

  // Run immediately on startup
  cancelExpiredCODOrders().then((count) => {
    if (count > 0) {
      logger.info(`Initial run: Cancelled ${count} expired COD orders`);
    }
  });

  detectOverdueRentals().then((count) => {
    if (count > 0) {
      logger.info(`Initial run: Detected ${count} overdue rentals`);
    }
  });

  // Cancel expired COD orders every 10 minutes
  setInterval(async () => {
    const count = await cancelExpiredCODOrders();
    if (count > 0) {
      logger.info(`Cancelled ${count} expired COD orders`);
    }
  }, 10 * 60 * 1000);

  // Detect overdue rentals every 30 minutes
  setInterval(async () => {
    const count = await detectOverdueRentals();
    if (count > 0) {
      logger.info(`Detected ${count} overdue rentals`);
    }
  }, 30 * 60 * 1000);

  logger.info("Cron jobs started successfully");
}
