import { apiGet, apiPost, apiPatch } from "@/lib/api";

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

export type OrdersListResponse = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const ordersApi = {
  // User orders
  create: (payload: CreateOrderPayload) => apiPost<Order>("/orders", payload),
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    apiGet<OrdersListResponse>("/orders", params),
  getById: (id: string) => apiGet<Order>(`/orders/${id}`),
  deliverOrder: (id: string) => apiPatch<Order>(`/orders/${id}/deliver`, {}),
  getActiveRentals: () => apiGet<OrdersListResponse>("/orders/active-rentals"),

  // Admin orders (same endpoints but may need admin permissions)
  admin: {
    getAll: (params?: { status?: string; page?: number; limit?: number; search?: string }) =>
      apiGet<OrdersListResponse>("/orders", params),
    getById: (id: string) => apiGet<Order>(`/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      apiPatch<Order>(`/orders/${id}/status`, { status }),
    confirmOrder: (id: string) => apiPatch<Order>(`/orders/${id}/confirm`, {}),
    shipOrder: (id: string) => apiPatch<Order>(`/orders/${id}/ship`, {}),
    completeOrder: (id: string, actualReturnDate?: string) =>
      apiPatch<Order>(`/orders/${id}/complete`, { actualReturnDate }),
  },
};
