export type Coupon = {
  _id: string;
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponValidateResult = {
  coupon: Coupon;
  discount: number;
};

export type CouponsListResponse = {
  data: Coupon[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
