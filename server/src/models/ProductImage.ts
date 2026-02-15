import { Schema, model, Types } from "mongoose";

export interface ProductImageDoc {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  url: string;
  publicId: string;
  sortOrder: number;
  altText?: string;
  createdAt: Date;
}

const ProductImageSchema = new Schema<ProductImageDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "Variant" },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    altText: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ProductImageSchema.index({ productId: 1, sortOrder: 1 });

export const ProductImageModel = model<ProductImageDoc>("ProductImage", ProductImageSchema);
