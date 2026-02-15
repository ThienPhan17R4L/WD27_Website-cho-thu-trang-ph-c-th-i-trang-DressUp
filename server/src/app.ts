import express from "express";
import cors from "cors";
import registerRoutes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { correlationIdMiddleware } from "./middlewares/correlationId";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: env.APP_ORIGIN,
    credentials: true,
  })
);

// Correlation ID (before logging so it's available in logs)
app.use(correlationIdMiddleware);

// Request logging
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Swagger docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
registerRoutes(app);

// Error handler MUST be registered after all routes
app.use(errorHandler);

export default app;
