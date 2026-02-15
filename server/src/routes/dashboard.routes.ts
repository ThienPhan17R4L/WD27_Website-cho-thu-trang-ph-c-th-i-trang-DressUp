import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { dashboardController } from "../controllers/dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requireAdmin);

dashboardRouter.get("/overview", dashboardController.overview);
