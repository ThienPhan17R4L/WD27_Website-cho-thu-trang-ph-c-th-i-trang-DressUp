import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { adminUserController } from "../controllers/admin-user.controller";

export const adminUserRouter = Router();

adminUserRouter.use(requireAuth, requireAdmin);

adminUserRouter.get("/", adminUserController.list);
adminUserRouter.get("/:id", adminUserController.getById);
adminUserRouter.post("/staff", adminUserController.createStaff);
adminUserRouter.patch("/:id/roles", adminUserController.updateRoles);
adminUserRouter.patch("/:id/block", adminUserController.block);
adminUserRouter.patch("/:id/unblock", adminUserController.unblock);
