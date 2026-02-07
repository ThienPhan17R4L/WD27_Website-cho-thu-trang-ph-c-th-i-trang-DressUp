import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAuth } from "../middlewares/auth.middleware";

export const paymentRouter = Router();

// Protected routes (require authentication)
paymentRouter.post(
  "/momo/create",
  requireAuth,
  asyncHandler(PaymentController.createMoMoPayment)
);

// Public routes (webhooks/callbacks)
paymentRouter.post("/momo/callback", asyncHandler(PaymentController.momoCallback));

// Test endpoint (DEV ONLY)
if (process.env.NODE_ENV !== "production") {
  paymentRouter.get("/momo/test/:orderId", asyncHandler(PaymentController.testMoMoSuccess));
}
