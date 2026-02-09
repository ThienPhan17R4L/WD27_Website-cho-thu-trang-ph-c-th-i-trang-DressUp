import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody } from "../middlewares/validate";
import { createOrderSchema } from "../schemas/order.schema";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.post("/", validateBody(createOrderSchema), asyncHandler(OrderController.create));
orderRouter.get("/", asyncHandler(OrderController.getAll));

// Active rentals (must be before /:id to avoid route conflict)
orderRouter.get("/active-rentals", asyncHandler(OrderController.getActiveRentals));

orderRouter.get("/:id", asyncHandler(OrderController.getById));

// Order status transitions - Admin only
orderRouter.patch("/:id/confirm", requireAdmin, asyncHandler(OrderController.confirmOrder));
orderRouter.patch("/:id/ship", requireAdmin, asyncHandler(OrderController.shipOrder));
orderRouter.patch("/:id/complete", requireAdmin, asyncHandler(OrderController.completeOrder));

// Order status transitions - Client
orderRouter.patch("/:id/deliver", asyncHandler(OrderController.deliverOrder));
