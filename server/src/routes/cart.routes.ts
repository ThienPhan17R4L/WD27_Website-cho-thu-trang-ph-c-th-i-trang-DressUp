import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody } from "../middlewares/validate";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from "../schemas/cart.schema";
import { requireAuth } from "../middlewares/auth.middleware";

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", asyncHandler(CartController.get));
cartRouter.post("/", asyncHandler(CartController.add));
cartRouter.patch("/", asyncHandler(CartController.update));
cartRouter.delete("/", asyncHandler(CartController.remove));
cartRouter.delete("/clear", asyncHandler(CartController.clear));
