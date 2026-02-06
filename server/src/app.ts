import express from "express";
import cors from "cors";
import registerRoutes from "./routes";
import { requireAuth } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/errorHanler";
import { env } from "process";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from 'morgan';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.APP_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

registerRoutes(app);

// Error handler MUST be registered after all routes
app.use(errorHandler);

export default app;
