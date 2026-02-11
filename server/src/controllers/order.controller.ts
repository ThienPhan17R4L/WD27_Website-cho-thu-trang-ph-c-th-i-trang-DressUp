import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { OrderModel } from "../models/Order";

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

  /**
   * PATCH /api/orders/:id/confirm
   * Admin xác nhận đơn hàng (COD only)
   */
  async confirmOrder(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const order = await OrderService.confirmOrder(id);
    res.json(order);
  },

  /**
   * PATCH /api/orders/:id/ship
   * Admin gửi hàng
   */
  async shipOrder(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const order = await OrderService.shipOrder(id);
    res.json(order);
  },

  /**
   * PATCH /api/orders/:id/deliver
   * Client xác nhận đã nhận hàng
   */
  async deliverOrder(req: Request, res: Response) {
    const { id } = req.params;
    const userId = (req as any).user!.id as string;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    // Verify order ownership before allowing delivery confirmation
    await OrderService.getOrderById(id, userId);

    // Update order status
    const order = await OrderService.deliverOrder(id);
    res.json(order);
  },

  /**
   * PATCH /api/orders/:id/complete
   * Hoàn thành đơn hàng (đã trả đồ)
   */
  async completeOrder(req: Request, res: Response) {
    const { id } = req.params;
    const { actualReturnDate } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const order = await OrderService.completeOrder(id, actualReturnDate);
    res.json(order);
  },

  /**
   * GET /api/orders/active-rentals
   * Lấy danh sách đơn hàng đang được thuê (status = renting hoặc delivered)
   */
  async getActiveRentals(req: Request, res: Response) {
    const userId = (req as any).user!.id as string;

    const rentals = await OrderModel.find({
      userId,
      status: { $in: ["delivered", "renting"] },
    })
      .populate("items.productId")
      .sort({ deliveredAt: -1 });

    res.json({ items: rentals });
  },
};
