import { apiGet, apiPost, apiPatch } from "@/lib/api";
import type { StatusHistoryEntry, ShippingAddress } from "@/types/order";
import type { Return as ReturnRecord } from "@/types/return";

export type Order = {
  _id: string;
  userId: string;
  orderNumber: string;
  items: any[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  shippingFee: number;
  serviceFee: number;
  couponCode?: string;
  couponDiscount: number;
  totalDeposit: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  statusHistory: StatusHistoryEntry[];
  notes?: string;
  pickupDeadline?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  returnedAt?: string;
  inspectedAt?: string;
  actualReturnDate?: string;
  lateFee: number;
  depositRefunded: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderPayload = {
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "vnpay" | "momo" | "zalopay" | "mock";
  notes?: string;
  couponCode?: string;
};

export type InspectionItemPayload = {
  orderItemIndex: number;
  conditionAfter: string;
  damageNotes?: string;
  damageFee: number;
};

export type InspectionPayload = {
  items: InspectionItemPayload[];
  notes?: string;
};

export type { ReturnRecord };

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
  getActiveRentals: () => apiGet<{ items: Order[] }>("/orders/active-rentals"),
  getLateFee: (id: string) => apiGet<{ lateFee: number }>(`/orders/${id}/late-fee`),
  getReturn: (id: string) => apiGet<ReturnRecord | null>(`/orders/${id}/return`),

  // Customer actions
  deliverOrder: (id: string) => apiPatch<Order>(`/orders/${id}/deliver`, {}),
  activateRental: (id: string) => apiPatch<Order>(`/orders/${id}/activate`, {}),
  cancelOrder: (id: string, reason?: string) =>
    apiPatch<Order>(`/orders/${id}/cancel`, { reason }),

  // Admin/Staff orders
  admin: {
    getAll: (params?: { status?: string; page?: number; limit?: number; search?: string }) =>
      apiGet<OrdersListResponse>("/orders", params),
    getById: (id: string) => apiGet<Order>(`/orders/${id}`),
    confirmOrder: (id: string) => apiPatch<Order>(`/orders/${id}/confirm`, {}),
    pickOrder: (id: string) => apiPatch<Order>(`/orders/${id}/pick`, {}),
    shipOrder: (id: string) => apiPatch<Order>(`/orders/${id}/ship`, {}),
    deliverOrder: (id: string) => apiPatch<Order>(`/orders/${id}/deliver`, {}),
    activateRental: (id: string) => apiPatch<Order>(`/orders/${id}/activate`, {}),
    cancelOrder: (id: string, reason?: string) =>
      apiPatch<Order>(`/orders/${id}/cancel`, { reason }),
    activateCodRental: (id: string) => apiPatch<Order>(`/orders/${id}/activate-cod`, {}),
    markReturned: (id: string) => apiPatch<Order>(`/orders/${id}/mark-returned`, {}),
    startInspection: (id: string) => apiPatch<Order>(`/orders/${id}/start-inspection`, {}),
    completeInspection: (id: string, payload: InspectionPayload) =>
      apiPatch<{ order: Order; returnRecord: ReturnRecord }>(`/orders/${id}/complete`, payload),
    getReturn: (id: string) => apiGet<ReturnRecord | null>(`/orders/${id}/return`),
    updateStatus: (id: string, status: string) => {
      const map: Record<string, () => Promise<Order>> = {
        confirmed: () => apiPatch<Order>(`/orders/${id}/confirm`, {}),
        picking: () => apiPatch<Order>(`/orders/${id}/pick`, {}),
        shipping: () => apiPatch<Order>(`/orders/${id}/ship`, {}),
        delivered: () => apiPatch<Order>(`/orders/${id}/deliver`, {}),
        active_rental: () => apiPatch<Order>(`/orders/${id}/activate`, {}),
        cancelled: () => apiPatch<Order>(`/orders/${id}/cancel`, {}),
      };
      const fn = map[status];
      if (!fn) return Promise.reject(new Error(`Không hỗ trợ chuyển sang trạng thái: ${status}`));
      return fn();
    },
  },
};
