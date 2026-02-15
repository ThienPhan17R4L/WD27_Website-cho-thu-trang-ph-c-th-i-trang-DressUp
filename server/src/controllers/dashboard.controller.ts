import { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  overview: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getOverview();
      return res.json({ data });
    } catch (e) {
      next(e);
    }
  },
};
