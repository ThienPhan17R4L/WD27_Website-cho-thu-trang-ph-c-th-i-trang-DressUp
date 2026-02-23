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

// Mock payment endpoints (for testing)
paymentRouter.get("/mock/:orderId", requireAuth, asyncHandler(PaymentController.getMockPayment));
paymentRouter.post("/mock/:orderId/success", requireAuth, asyncHandler(PaymentController.completeMockPayment));
paymentRouter.post("/mock/:orderId/fail", requireAuth, asyncHandler(PaymentController.failMockPayment));

// Test endpoint (DEV ONLY)
if (process.env.NODE_ENV !== "production") {
  paymentRouter.get("/momo/status/:orderId", asyncHandler(PaymentController.checkMoMoStatus));
}
