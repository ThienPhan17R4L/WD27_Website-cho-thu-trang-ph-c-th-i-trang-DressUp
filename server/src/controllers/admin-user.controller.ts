import { Request, Response, NextFunction } from "express";
import { adminUserService } from "../services/admin-user.service";

export const adminUserController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminUserService.listUsers({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        search: req.query.search as string,
        role: req.query.role as string,
        status: req.query.status as string,
      });
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await adminUserService.getUserById(String(req.params.id));
      return res.json({ data: user });
    } catch (e) {
      next(e);
    }
  },

  createStaff: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, fullName, phone } = req.body;
      const user = await adminUserService.createStaff({ email, password, fullName, phone });
      return res.status(201).json({ data: user });
    } catch (e) {
      next(e);
    }
  },

  updateRoles: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await adminUserService.updateRoles(String(req.params.id), req.body.roles);
      return res.json({ data: user });
    } catch (e) {
      next(e);
    }
  },

  block: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await adminUserService.blockUser(String(req.params.id), req.body.reason);
      return res.json({ data: user });
    } catch (e) {
      next(e);
    }
  },

  unblock: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await adminUserService.unblockUser(String(req.params.id));
      return res.json({ data: user });
    } catch (e) {
      next(e);
    }
  },
};
