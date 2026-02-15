import { Schema, model, Types } from "mongoose";

export interface VariantDoc {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  size: string;
  color?: string;
  condition: "new" | "like-new" | "good";
  rentalPricePerDay?: number;
  depositOverride?: number;
  images?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<VariantDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    condition: { type: String, enum: ["new", "like-new", "good"], default: "new" },
    rentalPricePerDay: { type: Number, min: 0 },
    depositOverride: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

VariantSchema.index({ productId: 1, size: 1, color: 1 }, { unique: true });

export const VariantModel = model<VariantDoc>("Variant", VariantSchema);
