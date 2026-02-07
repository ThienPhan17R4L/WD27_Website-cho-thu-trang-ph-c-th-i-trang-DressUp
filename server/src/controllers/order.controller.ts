import { Request, Response } from "express";
import { OrderService } from "../services/order.service";

export const OrderController = {
  async create(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const order = await OrderService.createOrder(userId, req.body);
    res.status(201).json(order);
  },

  async getById(req: Request, res: Response) {
    const userId = (req as any).user!.id as string;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const order = await OrderService.getOrderById(id, userId);
    res.json(order);
  },

  async getAll(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const { status, page, limit } = req.query;

    const filters: { status?: string; page?: number; limit?: number } = {};
    if (typeof status === "string") {
      filters.status = status;
    }
    if (typeof page === "string") {
      filters.page = parseInt(page);
    }
    if (typeof limit === "string") {
      filters.limit = parseInt(limit);
    }

    const orders = await OrderService.getOrders(userId, filters);
    res.json(orders);
  },
};
