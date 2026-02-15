import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireStaffOrAdmin } from "../middlewares/staff.middleware";
import { returnController } from "../controllers/return.controller";

export const returnRouter = Router();

// Customer: initiate return
returnRouter.post("/orders/:orderId/return", requireAuth, returnController.initiate);

// Staff/Admin: list & manage returns
returnRouter.get("/returns", requireAuth, requireStaffOrAdmin, returnController.list);
returnRouter.get("/returns/:id", requireAuth, requireStaffOrAdmin, returnController.getById);
returnRouter.patch("/returns/:id/inspect", requireAuth, requireStaffOrAdmin, returnController.inspect);
returnRouter.patch("/returns/:id/close", requireAuth, requireStaffOrAdmin, returnController.close);
