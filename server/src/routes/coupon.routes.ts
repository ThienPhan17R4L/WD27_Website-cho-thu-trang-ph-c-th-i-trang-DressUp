import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { couponController } from "../controllers/coupon.controller";

export const couponRouter = Router();

// Customer: validate coupon
couponRouter.post("/validate", requireAuth, couponController.validate);

// Admin CRUD
couponRouter.get("/admin", requireAuth, requireAdmin, couponController.list);
couponRouter.post("/admin", requireAuth, requireAdmin, couponController.create);
couponRouter.patch("/admin/:id", requireAuth, requireAdmin, couponController.update);
couponRouter.delete("/admin/:id", requireAuth, requireAdmin, couponController.remove);
