import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { auditController } from "../controllers/audit.controller";

export const auditRouter = Router();

auditRouter.use(requireAuth, requireAdmin);

auditRouter.get("/", auditController.list);
auditRouter.get("/:entity/:entityId", auditController.getTrail);
