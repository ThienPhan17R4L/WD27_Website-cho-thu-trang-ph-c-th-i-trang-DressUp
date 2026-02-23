import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireStaffOrAdmin } from "../middlewares/staff.middleware";
import { inventoryController } from "../controllers/inventory.controller";

export const inventoryRouter = Router();

inventoryRouter.use(requireAuth, requireStaffOrAdmin);

inventoryRouter.get("/", inventoryController.list);
inventoryRouter.get("/grouped", inventoryController.getGrouped);
inventoryRouter.post("/create-for-variant", inventoryController.createForVariant);
inventoryRouter.post("/:id/add-stock", inventoryController.addStock);
inventoryRouter.post("/:id/remove-stock", inventoryController.removeStock);
inventoryRouter.post("/:id/mark-cleaned", inventoryController.markCleaned);
inventoryRouter.post("/:id/mark-repaired", inventoryController.markRepaired);
inventoryRouter.post("/:id/mark-broken", inventoryController.markBroken);
inventoryRouter.get("/:productId", inventoryController.getByProduct);
inventoryRouter.patch("/:id/adjust", inventoryController.adjust);
