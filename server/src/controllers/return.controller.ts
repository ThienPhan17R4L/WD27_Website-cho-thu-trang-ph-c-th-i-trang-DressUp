import { Request, Response, NextFunction } from "express";
import { returnService } from "../services/return.service";

export const returnController = {
  initiate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user!.id;
      const orderId = String(req.params.orderId);
      const result = await returnService.initiateReturn(orderId, userId, req.body);
      return res.status(201).json({ data: result });
    } catch (e) {
      next(e);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await returnService.list({
        status: req.query.status as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await returnService.getById(String(req.params.id));
      return res.json({ data: result });
    } catch (e) {
      next(e);
    }
  },

  inspect: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const staffId = (req as any).user!.id;
      const result = await returnService.inspectReturn(
        String(req.params.id),
        staffId,
        req.body.items
      );
      return res.json({ data: result });
    } catch (e) {
      next(e);
    }
  },

  close: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const staffId = (req as any).user!.id;
      const result = await returnService.closeReturn(String(req.params.id), staffId);
      return res.json({ data: result });
    } catch (e) {
      next(e);
    }
  },
};
