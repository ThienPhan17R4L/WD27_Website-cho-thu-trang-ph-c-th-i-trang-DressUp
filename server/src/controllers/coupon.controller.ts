import { Request, Response, NextFunction } from "express";
import { couponService } from "../services/coupon.service";

export const couponController = {
  validate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, subtotal } = req.body;
      const result = await couponService.validate(code, Number(subtotal) || 0);
      return res.json({ data: { discount: result.discount, couponCode: result.coupon.code } });
    } catch (e) {
      next(e);
    }
  },

  // Admin CRUD
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await couponService.list({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coupon = await couponService.create(req.body);
      return res.status(201).json({ data: coupon });
    } catch (e) {
      next(e);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coupon = await couponService.update(String(req.params.id), req.body);
      return res.json({ data: coupon });
    } catch (e) {
      next(e);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await couponService.remove(String(req.params.id));
      return res.json({ message: "Coupon deleted" });
    } catch (e) {
      next(e);
    }
  },
};
