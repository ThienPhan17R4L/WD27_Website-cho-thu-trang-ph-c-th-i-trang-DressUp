import { connectDb } from "./config/db";
import { env } from "./config/env";
import app from "./app";
import { startCronJobs } from "./jobs";

async function bootstrap() {
  await connectDb();

  // Start cron jobs (auto-cancel expired COD orders, etc.)
  startCronJobs();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal bootstrap error:", err);
  process.exit(1);
});
