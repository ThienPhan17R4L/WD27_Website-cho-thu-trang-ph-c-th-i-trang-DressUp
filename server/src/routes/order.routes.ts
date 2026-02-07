import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody } from "../middlewares/validate";
import { createOrderSchema } from "../schemas/order.schema";
import { requireAuth } from "../middlewares/auth.middleware";

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.post("/", validateBody(createOrderSchema), asyncHandler(OrderController.create));
orderRouter.get("/", asyncHandler(OrderController.getAll));
orderRouter.get("/:id", asyncHandler(OrderController.getById));
