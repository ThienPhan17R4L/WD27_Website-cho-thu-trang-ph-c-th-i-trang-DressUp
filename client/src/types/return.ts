export type ReturnStatus = "pending_inspection" | "inspected" | "closed";

export type ReturnItem = {
  orderItemIndex: number;
  productId: string;
  variantKey: { size?: string; color?: string };
  conditionBefore: string;
  conditionAfter: string;
  damageNotes: string;
  damageFee: number;
};

export type Return = {
  _id: string;
  orderId: string;
  userId: string;
  returnMethod: "in_store" | "shipping";
  trackingNumber?: string;
  status: ReturnStatus;
  items: ReturnItem[];
  totalDamageFee: number;
  lateFee: number;
  depositRefundAmount: number;
  inspectedBy?: string;
  inspectedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReturnsListResponse = {
  data: Return[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
