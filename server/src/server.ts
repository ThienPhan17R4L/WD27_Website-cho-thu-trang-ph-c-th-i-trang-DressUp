import { connectDb } from "./config/db";
import { env } from "./config/env";
import app from "./app";
import { startCronJobs } from "./jobs";
import { logger } from "./utils/logger";

async function bootstrap() {
  await connectDb();

  // Start cron jobs (auto-cancel expired COD orders, etc.)
  startCronJobs();

  app.listen(env.PORT, () => {
    logger.info(`API running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.error("Fatal bootstrap error", { error: String(err) });
  process.exit(1);
});
