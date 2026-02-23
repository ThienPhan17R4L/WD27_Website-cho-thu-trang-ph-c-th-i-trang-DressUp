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
cartRouter.get("/debug", asyncHandler(CartController.debug));
cartRouter.post("/", validateBody(addToCartSchema), asyncHandler(CartController.add));
cartRouter.patch("/", validateBody(updateCartItemSchema), asyncHandler(CartController.update));
cartRouter.delete("/", validateBody(removeCartItemSchema), asyncHandler(CartController.remove));
cartRouter.delete("/clear", asyncHandler(CartController.clear));
