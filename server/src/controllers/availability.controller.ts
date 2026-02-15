import { Request, Response, NextFunction } from "express";
import { availabilityService } from "../services/availability.service";

export const availabilityController = {
  check: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const { size, color, startDate, endDate, quantity } = req.query;

      const result = await availabilityService.checkAvailability(
        String(productId),
        String(size),
        color ? String(color) : undefined,
        new Date(String(startDate)),
        new Date(String(endDate)),
        Number(quantity) || 1
      );
      return res.json({ data: result });
    } catch (e) {
      next(e);
    }
  },

  calendar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const { size, color, year, month } = req.query;

      const calendar = await availabilityService.getCalendar(
        String(productId),
        String(size),
        color ? String(color) : undefined,
        Number(year) || new Date().getFullYear(),
        Number(month) || new Date().getMonth() + 1
      );
      return res.json({ data: calendar });
    } catch (e) {
      next(e);
    }
  },
};
