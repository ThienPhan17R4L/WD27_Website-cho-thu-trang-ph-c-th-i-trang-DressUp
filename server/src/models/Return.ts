import { Schema, model, Types } from "mongoose";

export interface ReturnItemDoc {
  orderItemIndex: number;
  productId: Types.ObjectId;
  variantKey: { size: string; color?: string };
  conditionBefore: string;
  conditionAfter: string;
  damageNotes?: string;
  damageFee: number;
}

export interface ReturnDoc {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  returnMethod: "in_store" | "shipping";
  trackingNumber?: string;
  returnedAt: Date;
  status: "pending_inspection" | "inspected" | "closed";
  inspectedBy?: Types.ObjectId;
  inspectedAt?: Date;
  items: ReturnItemDoc[];
  totalDamageFee: number;
  lateFee: number;
  depositRefundAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnSchema = new Schema<ReturnDoc>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    returnMethod: { type: String, enum: ["in_store", "shipping"], default: "in_store" },
    trackingNumber: { type: String, trim: true },
    returnedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending_inspection", "inspected", "closed"],
      default: "pending_inspection",
    },
    inspectedBy: { type: Schema.Types.ObjectId, ref: "user" },
    inspectedAt: { type: Date },
    items: [
      {
        orderItemIndex: { type: Number, required: true },
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        variantKey: {
          size: { type: String },
          color: { type: String },
        },
        conditionBefore: { type: String, default: "new" },
        conditionAfter: { type: String, default: "new" },
        damageNotes: { type: String },
        damageFee: { type: Number, default: 0 },
        _id: false,
      },
    ],
    totalDamageFee: { type: Number, default: 0 },
    lateFee: { type: Number, default: 0 },
    depositRefundAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ReturnModel = model<ReturnDoc>("Return", ReturnSchema);
