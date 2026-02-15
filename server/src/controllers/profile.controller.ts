import { Request, Response, NextFunction } from "express";
import { profileService } from "../services/profile.service";

export const profileController = {
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user!.id;
      const user = await profileService.getProfile(userId);
      return res.json({ data: user });
    } catch (e) {
      next(e);
    }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user!.id;
      const user = await profileService.updateProfile(userId, req.body);
      return res.json({ data: user });
    } catch (e) {
      next(e);
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user!.id;
      await profileService.changePassword(userId, req.body);
      return res.json({ message: "Password changed successfully" });
    } catch (e) {
      next(e);
    }
  },
};
