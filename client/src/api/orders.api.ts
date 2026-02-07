import { apiGet, apiPost } from "@/lib/api";

export type Order = {
  _id: string;
  userId: string;
  orderNumber: string;
  items: any[];
  shippingAddress: any;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  notes?: string;
  pickupDeadline?: string; // ISO date string for COD orders (2 hours from creation)
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderPayload = {
  shippingAddress: {
    receiverName: string;
    receiverPhone: string;
    line1: string;
    ward: string;
    district: string;
    province: string;
    country?: string;
    postalCode?: string;
  };
  paymentMethod: "cod" | "vnpay" | "momo" | "zalopay";
  notes?: string;
};

export const ordersApi = {
  create: (payload: CreateOrderPayload) => apiPost<Order>("/orders", payload),
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    apiGet<{ items: Order[]; page: number; limit: number; total: number; totalPages: number }>(
      "/orders",
      params
    ),
  getById: (id: string) => apiGet<Order>(`/orders/${id}`),
};
