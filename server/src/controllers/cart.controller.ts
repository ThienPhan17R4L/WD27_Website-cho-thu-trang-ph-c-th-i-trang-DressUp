import { Request, Response } from "express";
import { CartService } from "../services/cart.service";

export const CartController = {
  async get(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const cart = await CartService.getCart(userId);
    res.json(cart);
  },

  async add(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const cart = await CartService.addItem(userId, req.body);
    res.status(201).json(cart);
  },

  async update(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const { productId, quantity } = req.body;
    const cart = await CartService.updateQuantity(userId, productId, quantity);
    res.json(cart);
  },

  async remove(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const { productId } = req.body;
    const cart = await CartService.removeItem(userId, productId);
    res.json(cart);
  },

  async clear(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const cart = await CartService.clear(userId);
    res.json(cart);
  },
};
