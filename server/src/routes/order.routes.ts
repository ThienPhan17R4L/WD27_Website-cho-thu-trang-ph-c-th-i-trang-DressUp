import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody } from "../middlewares/validate";
import { createOrderSchema } from "../schemas/order.schema";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { requireStaffOrAdmin } from "../middlewares/staff.middleware";

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.post("/", validateBody(createOrderSchema), asyncHandler(OrderController.create));
orderRouter.get("/", asyncHandler(OrderController.getAll));

// Active rentals (must be before /:id to avoid route conflict)
orderRouter.get("/active-rentals", asyncHandler(OrderController.getActiveRentals));

orderRouter.get("/:id", asyncHandler(OrderController.getById));
orderRouter.get("/:id/late-fee", asyncHandler(OrderController.getLateFee));

// Order status transitions - Admin/Staff
orderRouter.patch("/:id/confirm", requireAdmin, asyncHandler(OrderController.confirmOrder));
orderRouter.patch("/:id/pick", requireStaffOrAdmin, asyncHandler(OrderController.pickOrder));
orderRouter.patch("/:id/ship", requireStaffOrAdmin, asyncHandler(OrderController.shipOrder));

// COD: xác nhận thanh toán tại shop + kích hoạt thuê (bỏ qua shipping)
orderRouter.patch("/:id/activate-cod", requireAdmin, asyncHandler(OrderController.activateCodRental));

// Order status transitions - Customer
orderRouter.patch("/:id/deliver", asyncHandler(OrderController.deliverOrder));
orderRouter.patch("/:id/activate", asyncHandler(OrderController.activateRental));
orderRouter.patch("/:id/cancel", asyncHandler(OrderController.cancelOrder));

// Additional status transitions - Staff/Admin
orderRouter.patch("/:id/mark-returned", requireStaffOrAdmin, asyncHandler(OrderController.markReturned));
orderRouter.patch("/:id/start-inspection", requireStaffOrAdmin, asyncHandler(OrderController.startInspection));
orderRouter.patch("/:id/complete", requireStaffOrAdmin, asyncHandler(OrderController.completeOrder));

// Return/inspection record
orderRouter.get("/:id/return", asyncHandler(OrderController.getReturn));
