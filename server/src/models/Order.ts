import { Schema, model, Types } from "mongoose";

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
  // Legacy statuses for backward compatibility
  | "pending"
  | "renting";

export type PaymentMethod = "cod" | "vnpay" | "momo" | "zalopay" | "mock";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface StatusHistoryEntry {
  status: string;
  timestamp: Date;
  changedBy?: string;
  notes?: string;
}

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
  orderNumber: string;

  items: OrderItem[];
  shippingAddress: ShippingAddress;

  subtotal: number;
  discount: number;
  shippingFee: number;
  serviceFee: number;
  couponCode?: string;
  couponDiscount: number;
  totalDeposit: number;
  total: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: any;

  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];

  notes?: string;

  // Rental tracking
  pickupDeadline?: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  returnedAt?: Date;
  inspectedAt?: Date;
  actualReturnDate?: Date;
  lateFee: number;
  depositRefunded: number;

  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<StatusHistoryEntry>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    changedBy: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

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
    serviceFee: { type: Number, default: 0, min: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0, min: 0 },
    totalDeposit: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cod", "vnpay", "momo", "zalopay", "mock"],
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
      enum: [
        "draft", "pending_payment", "confirmed", "picking", "shipping",
        "delivered", "active_rental", "returned", "overdue", "inspecting",
        "completed", "cancelled",
        // Legacy
        "pending", "renting",
      ],
      default: "pending_payment",
      index: true,
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    notes: { type: String },
    pickupDeadline: { type: Date },
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    returnedAt: { type: Date },
    inspectedAt: { type: Date },
    actualReturnDate: { type: Date },
    lateFee: { type: Number, default: 0, min: 0 },
    depositRefunded: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const OrderModel = model<OrderDoc>("Order", OrderSchema);
