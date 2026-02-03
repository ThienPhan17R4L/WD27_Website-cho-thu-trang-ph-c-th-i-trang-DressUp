import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody, validateQuery } from "../middlewares/validate";
import {
  categoryIdParamSchema,
  categorySlugParamSchema,
  createCategorySchema,
  listCategoriesSchema,
  updateCategorySchema,
} from "../schemas/category.schema";

export const categoryRouter = Router();

categoryRouter.get("/", asyncHandler(CategoryController.list));
categoryRouter.get("/tree", asyncHandler(CategoryController.tree));
categoryRouter.post("/", validateBody(createCategorySchema), asyncHandler(CategoryController.create));

categoryRouter.get(
  "/slug/:slug",
  asyncHandler(CategoryController.getBySlug)
);

categoryRouter.get(
  "/:id",
  asyncHandler(CategoryController.getById)
);

categoryRouter.patch(
  "/:id",
  validateBody(updateCategorySchema),
  asyncHandler(CategoryController.update)
);

categoryRouter.delete(
  "/:id",
  asyncHandler(CategoryController.remove)
);
