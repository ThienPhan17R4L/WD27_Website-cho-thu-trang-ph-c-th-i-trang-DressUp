import { Schema, model, Types } from "mongoose";

export interface RentalTier {
  label: string;        // "1 day", "3 days", "7 days"
  days: number;         // 1, 3, 7
  price: number;        // VND
}

export interface Variant {
  size: string;         // "S" | "M" | "L" | ...
  color?: string;       // "Black"
  skuHint?: string;     // optional display code
}

export interface ProductDoc {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  categoryId: Types.ObjectId;
  brand?: string;
  material?: string;
  colorFamily?: string;
  images: string[];
  rentalTiers: RentalTier[];
  depositDefault: number;
  variants: Variant[];
  tags: string[];
  care?: string;
  notes?: string;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const RentalTierSchema = new Schema<RentalTier>(
  {
    label: { type: String, required: true, trim: true },
    days: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const VariantSchema = new Schema<Variant>(
  {
    size: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    skuHint: { type: String, trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String, trim: true },
    material: { type: String, trim: true },
    colorFamily: { type: String, trim: true },
    images: { type: [String], default: [] },
    rentalTiers: { type: [RentalTierSchema], default: [] },
    depositDefault: { type: Number, default: 0, min: 0 },
    variants: { type: [VariantSchema], default: [] },
    tags: { type: [String], default: [] },
    care: { type: String },
    notes: { type: String },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

ProductSchema.index({ categoryId: 1, status: 1 });
ProductSchema.index({ name: "text", tags: "text", brand: "text" });

export const ProductModel = model<ProductDoc>("Product", ProductSchema);
