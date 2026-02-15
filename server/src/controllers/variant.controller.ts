import { Request, Response, NextFunction } from "express";
import { variantService } from "../services/variant.service";

export const variantController = {
  listByProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const variants = await variantService.listByProduct(String(req.params.productId));
      return res.json({ data: variants });
    } catch (e) {
      next(e);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const variant = await variantService.create(String(req.params.productId), req.body);
      return res.status(201).json({ data: variant });
    } catch (e) {
      next(e);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const variant = await variantService.update(String(req.params.id), req.body);
      return res.json({ data: variant });
    } catch (e) {
      next(e);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await variantService.remove(String(req.params.id));
      return res.json({ message: "Variant deleted" });
    } catch (e) {
      next(e);
    }
  },
};
