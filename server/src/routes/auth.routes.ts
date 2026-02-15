import { Router } from "express";
import { validateBody } from "../middlewares/validate";
import { authController } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { forgotPasswordSchema, resetPasswordSchema } from "../schemas/profile.schema";
import { authRateLimiter } from "../middlewares/rateLimit";

export const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  authController.register
);

authRouter.get("/verify-email", authController.verifyEmail);

authRouter.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  authController.login
);

authRouter.get("/me", authController.me);

authRouter.post(
  "/forgot-password",
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

authRouter.post(
  "/reset-password",
  authRateLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);
