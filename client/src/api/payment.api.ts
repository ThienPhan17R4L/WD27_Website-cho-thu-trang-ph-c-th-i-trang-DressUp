import { apiGet, apiPost } from "@/lib/api";
import type { Order } from "@/api/orders.api";

export const paymentApi = {
  getMockPayment: (orderId: string) => apiGet<Order>(`/payment/mock/${orderId}`),
  completeMockPayment: (orderId: string) => apiPost(`/payment/mock/${orderId}/success`, {}),
  failMockPayment: (orderId: string) => apiPost(`/payment/mock/${orderId}/fail`, {}),
};
