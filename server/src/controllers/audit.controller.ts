import { Request, Response, NextFunction } from "express";
import { auditService } from "../services/audit.service";

export const auditController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await auditService.getRecentLogs({
        entity: req.query.entity as string,
        performedBy: req.query.performedBy as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 50,
      });
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  getTrail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { entity, entityId } = req.params;
      const trail = await auditService.getAuditTrail(String(entity), String(entityId));
      return res.json({ data: trail });
    } catch (e) {
      next(e);
    }
  },
};
