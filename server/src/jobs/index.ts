import { cancelExpiredCODOrders } from "./cancelExpiredOrders";

/**
 * Start all cron jobs
 * - Cancel expired COD orders: every 10 minutes
 */
export function startCronJobs() {
  console.log("[CRON] Starting cron jobs...");

  // Run immediately on startup
  cancelExpiredCODOrders().then((count) => {
    if (count > 0) {
      console.log(`[CRON] Initial run: Cancelled ${count} expired COD orders`);
    }
  });

  // Run every 10 minutes (600,000 ms)
  setInterval(async () => {
    const count = await cancelExpiredCODOrders();
    if (count > 0) {
      console.log(`[CRON] Cancelled ${count} expired COD orders`);
    }
  }, 10 * 60 * 1000);

  console.log("[CRON] Cron jobs started successfully");
}
