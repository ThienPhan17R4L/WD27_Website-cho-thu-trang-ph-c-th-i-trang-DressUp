import { Request, Response, NextFunction } from "express";
import { addressService } from "../services/address.service";

export const addressController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user!.id;
      const addresses = await addressService.list(userId);
      return res.json({ data: addresses });
    } catch (e) {
      next(e);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user!.id;
      const address = await addressService.create(userId, req.body);
      return res.status(201).json({ data: address });
    } catch (e) {
      next(e);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user!.id;
      const address = await addressService.update(userId, String(req.params.id), req.body);
      return res.json({ data: address });
    } catch (e) {
      next(e);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user!.id;
      await addressService.remove(userId, String(req.params.id));
      return res.json({ message: "Address deleted" });
    } catch (e) {
      next(e);
    }
  },

  setDefault: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user!.id;
      const address = await addressService.setDefault(userId, String(req.params.id));
      return res.json({ data: address });
    } catch (e) {
      next(e);
    }
  },
};
