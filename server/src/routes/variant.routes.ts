import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { validateBody } from "../middlewares/validate";
import { variantController } from "../controllers/variant.controller";
import { createVariantSchema, updateVariantSchema } from "../schemas/variant.schema";

export const variantRouter = Router();

// Public: list variants for a product
variantRouter.get("/products/:productId/variants", variantController.listByProduct);

// Admin: CRUD
variantRouter.post(
  "/products/:productId/variants",
  requireAuth,
  requireAdmin,
  validateBody(createVariantSchema),
  variantController.create
);

variantRouter.patch(
  "/variants/:id",
  requireAuth,
  requireAdmin,
  validateBody(updateVariantSchema),
  variantController.update
);

variantRouter.delete(
  "/variants/:id",
  requireAuth,
  requireAdmin,
  variantController.remove
);
