import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireStaffOrAdmin } from "../middlewares/staff.middleware";
import { inventoryController } from "../controllers/inventory.controller";

export const inventoryRouter = Router();

inventoryRouter.use(requireAuth, requireStaffOrAdmin);

inventoryRouter.get("/", inventoryController.list);
inventoryRouter.get("/:productId", inventoryController.getByProduct);
inventoryRouter.patch("/:id/adjust", inventoryController.adjust);
