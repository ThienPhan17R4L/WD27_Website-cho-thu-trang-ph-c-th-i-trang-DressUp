import { Request, Response } from "express";
import { OrderService } from "../services/order.service";

export const OrderController = {
  async create(req: Request, res: Response) {
    const userId = (req as any).user!.id;
    const order = await OrderService.createOrder(userId, req.body);
    res.status(201).json(order);
  },

  async getById(req: Request, res: Response) {
    const user = (req as any).user!;
    const userId = user.id as string;
    const id = String(req.params.id);

    // Admin/Staff can view any order, regular users can only view their own
    const isStaffOrAdmin = user.roles?.includes("admin") || user.roles?.includes("staff");
    const order = isStaffOrAdmin
      ? await OrderService.getOrderByIdAdmin(id)
      : await OrderService.getOrderById(id, userId);

    res.json(order);
  },

  async getAll(req: Request, res: Response) {
    const user = (req as any).user!;
    const userId = user.id;
    const isStaffOrAdmin = user.roles?.includes("admin") || user.roles?.includes("staff");
    const { status, page, limit } = req.query;

    const filters: { status?: string; page?: number; limit?: number } = {};
    if (typeof status === "string") filters.status = status;
    if (typeof page === "string") filters.page = parseInt(page);
    if (typeof limit === "string") filters.limit = parseInt(limit);

    const orders = isStaffOrAdmin
      ? await OrderService.getAllOrders(filters)
      : await OrderService.getOrders(userId, filters);

    res.json(orders);
  },

  /** PATCH /orders/:id/confirm - Admin xác nhận đơn hàng */
  async confirmOrder(req: Request, res: Response) {
    const id = String(req.params.id);
    const adminId = (req as any).user!.id;
    const order = await OrderService.confirmOrder(id, adminId);
    res.json(order);
  },

  /** PATCH /orders/:id/pick - Staff chuẩn bị hàng */
  async pickOrder(req: Request, res: Response) {
    const id = String(req.params.id);
    const staffId = (req as any).user!.id;
    const order = await OrderService.pickOrder(id, staffId);
    res.json(order);
  },

  /** PATCH /orders/:id/ship - Admin gửi hàng */
  async shipOrder(req: Request, res: Response) {
    const id = String(req.params.id);
    const adminId = (req as any).user!.id;
    const order = await OrderService.shipOrder(id, adminId);
    res.json(order);
  },

  /** PATCH /orders/:id/deliver - Client xác nhận đã nhận hàng */
  async deliverOrder(req: Request, res: Response) {
    const id = String(req.params.id);
    const userId = (req as any).user!.id as string;
    const order = await OrderService.deliverOrder(id, userId);
    res.json(order);
  },

  /** PATCH /orders/:id/activate - Bắt đầu thuê */
  async activateRental(req: Request, res: Response) {
    const id = String(req.params.id);
    const userId = (req as any).user!.id as string;
    const order = await OrderService.activateRental(id, userId);
    res.json(order);
  },

  /** PATCH /orders/:id/cancel - Huỷ đơn hàng */
  async cancelOrder(req: Request, res: Response) {
    const id = String(req.params.id);
    const userId = (req as any).user!.id as string;
    const { reason } = req.body;
    const order = await OrderService.cancelOrder(id, userId, reason);
    res.json(order);
  },

  /** GET /orders/active-rentals */
  async getActiveRentals(req: Request, res: Response) {
    const userId = (req as any).user!.id as string;
    const rentals = await OrderService.getActiveRentals(userId);
    res.json({ items: rentals });
  },

  /** GET /orders/:id/late-fee - Xem phí trễ hạn (preview) */
  async getLateFee(req: Request, res: Response) {
    const id = String(req.params.id);
    const lateFee = await OrderService.calculateLateFee(id);
    res.json({ lateFee });
  },

  /** PATCH /orders/:id/mark-returned - Mark order as returned */
  async markReturned(req: Request, res: Response) {
    const id = String(req.params.id);
    const order = await OrderService.markReturned(id);
    res.json(order);
  },

  /** PATCH /orders/:id/start-inspection - Start inspection */
  async startInspection(req: Request, res: Response) {
    const id = String(req.params.id);
    const order = await OrderService.startInspection(id);
    res.json(order);
  },

  /** PATCH /orders/:id/complete - Complete order */
  async completeOrder(req: Request, res: Response) {
    const id = String(req.params.id);
    const order = await OrderService.completeOrder(id);
    res.json(order);
  },
};
