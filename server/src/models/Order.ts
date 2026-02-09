import { Schema, model, Types } from "mongoose";

export type OrderStatus =
  | "pending"        // Chờ xác nhận (mới tạo)
  | "confirmed"      // Đã xác nhận (admin xác nhận)
  | "shipping"       // Đang vận chuyển (admin gửi hàng)
  | "delivered"      // Đã giao hàng (khách nhận hàng)
  | "renting"        // Đang thuê (trong thời gian thuê)
  | "completed"      // Hoàn thành (đã trả đồ)
  | "cancelled";     // Đã hủy

export type PaymentMethod = "cod" | "vnpay" | "momo" | "zalopay";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: Types.ObjectId;
  name: string;
  image?: string;
  rental: {
    startDate: Date;
    endDate: Date;
    days: number;
    pricePerDay: number;
  };
  variant?: { size: string; color?: string };
  deposit: number;
  quantity: number;
  lineTotal: number;
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

export interface OrderDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  orderNumber: string; // e.g. "DU20250206001"

  items: OrderItem[];

  shippingAddress: ShippingAddress;

  subtotal: number;
  discount: number;
  shippingFee: number;
  totalDeposit: number; // Tổng tiền đặt cọc
  total: number; // Tổng tiền thuê (chưa bao gồm cọc)

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: any; // VNPay transaction info, etc.

  status: OrderStatus;

  notes?: string;

  // Rental tracking
  pickupDeadline?: Date; // For COD orders: 2 hours from order creation
  confirmedAt?: Date; // Thời gian admin xác nhận
  shippedAt?: Date; // Thời gian gửi hàng
  deliveredAt?: Date; // Thời gian khách nhận hàng
  actualReturnDate?: Date; // Thời gian khách trả đồ thực tế
  lateFee: number; // Phí phạt trả muộn
  depositRefunded: number; // Số tiền cọc đã hoàn

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String },
    rental: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      days: { type: Number, required: true },
      pricePerDay: { type: Number, required: true },
    },
    variant: {
      size: { type: String },
      color: { type: String },
    },
    deposit: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<ShippingAddress>(
  {
    receiverName: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    line1: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, default: "VN" },
    postalCode: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [OrderItemSchema],
    shippingAddress: { type: ShippingAddressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    totalDeposit: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cod", "vnpay", "momo", "zalopay"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentDetails: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "renting", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    notes: { type: String },
    // Rental tracking
    pickupDeadline: { type: Date },
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    actualReturnDate: { type: Date },
    lateFee: { type: Number, default: 0, min: 0 },
    depositRefunded: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Indexes for queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const OrderModel = model<OrderDoc>("Order", OrderSchema);
