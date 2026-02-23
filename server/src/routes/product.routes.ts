import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody, validateQuery } from "../middlewares/validate";
import {
  createProductSchema,
  listProductsSchema,
  productIdParamSchema,
  productSlugParamSchema,
  updateProductSchema,
} from "../schemas/product.shema";

export const productRouter = Router();

/**
 * LIST + CREATE
 * GET    /api/products
 * POST   /api/products
 */
productRouter.get("/", asyncHandler(ProductController.list));
productRouter.post("/", validateBody(createProductSchema), asyncHandler(ProductController.create));

/**
 * GET tag suggestions
 * GET /api/products/tags/suggestions?q=query
 */
productRouter.get("/tags/suggestions", asyncHandler(ProductController.getTagSuggestions));

/**
 * READ by slug (đặt trước :id để tránh conflict)
 * GET /api/products/slug/:slug
 */
productRouter.get(
  "/slug/:slug",
  asyncHandler(ProductController.getBySlug)
);

/**
 * READ/UPDATE/DELETE by id
 * GET    /api/products/:id
 * PATCH  /api/products/:id
 * DELETE /api/products/:id
 */
productRouter.get("/:id", asyncHandler(ProductController.getById));
productRouter.patch("/:id", validateBody(updateProductSchema), asyncHandler(ProductController.update));
productRouter.delete("/:id", validateBody(productIdParamSchema), asyncHandler(ProductController.remove));
