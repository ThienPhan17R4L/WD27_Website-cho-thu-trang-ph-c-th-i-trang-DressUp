import { Request, Response } from "express";
import { CartService } from "../services/cart.service";

export const CartController = {
  async get(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const cart = await CartService.getCart(userId);
    res.json(cart);
  },

  async debug(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const cart = await CartService.getCart(userId);

    // Check for items without rental dates
    const issues = cart.items.map((item: any, index: number) => ({
      index,
      name: item.name,
      hasRentalDates: !!(item.rental?.startDate && item.rental?.endDate),
      rental: item.rental || null,
    }));

    res.json({
      totalItems: cart.items.length,
      issues,
      itemsWithoutDates: issues.filter(i => !i.hasRentalDates).length,
    });
  },

  async add(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const cart = await CartService.addItem(userId, req.body);
    res.status(201).json(cart);
  },

  async update(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const { itemId, quantity, rentalStart, rentalEnd, variant } = req.body;
    const cart = await CartService.updateItem(userId, itemId, {
      quantity,
      rentalStart,
      rentalEnd,
      variant,
    });
    res.json(cart);
  },

  async remove(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const { itemId } = req.body;
    const cart = await CartService.removeItem(userId, itemId);
    res.json(cart);
  },

  async clear(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const cart = await CartService.clear(userId);
    res.json(cart);
  },
};
