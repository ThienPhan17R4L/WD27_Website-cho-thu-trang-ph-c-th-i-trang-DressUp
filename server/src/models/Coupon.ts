import { Schema, model, Types } from "mongoose";

export interface CouponDoc {
  _id: Types.ObjectId;
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableCategoryIds?: Types.ObjectId[];
  applicableProductIds?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<CouponDoc>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed_amount"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableCategoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    applicableProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

CouponSchema.index({ code: 1 });
CouponSchema.index({ validFrom: 1, validTo: 1, isActive: 1 });

export const CouponModel = model<CouponDoc>("Coupon", CouponSchema);
