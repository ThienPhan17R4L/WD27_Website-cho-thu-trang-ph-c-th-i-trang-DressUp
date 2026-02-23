export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "confirmed"
  | "picking"
  | "shipping"
  | "delivered"
  | "active_rental"
  | "returned"
  | "overdue"
  | "inspecting"
  | "completed"
  | "cancelled"
  // Legacy
  | "pending"
  | "renting";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  pending_payment: "Chờ thanh toán",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  picking: "Đang chuẩn bị",
  shipping: "Đang vận chuyển",
  delivered: "Đã giao hàng",
  active_rental: "Đang thuê",
  renting: "Đang thuê",
  returned: "Đã trả hàng",
  overdue: "Quá hạn",
  inspecting: "Đang kiểm tra",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_payment: "bg-yellow-100 text-yellow-700",
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  picking: "bg-indigo-100 text-indigo-700",
  shipping: "bg-purple-100 text-purple-700",
  delivered: "bg-teal-100 text-teal-700",
  active_rental: "bg-green-100 text-green-700",
  renting: "bg-green-100 text-green-700",
  returned: "bg-orange-100 text-orange-700",
  overdue: "bg-red-100 text-red-700",
  inspecting: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-500",
};

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  changedBy?: string;
  notes?: string;
}

export interface ShippingAddress {
  receiverName: string;
  receiverPhone: string;
  line1: string;
  ward: string;
  district: string;
  province: string;
  country?: string;
  postalCode?: string;
}
