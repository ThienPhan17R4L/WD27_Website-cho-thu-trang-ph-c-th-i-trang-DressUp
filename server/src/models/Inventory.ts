import { Schema, model, Types } from "mongoose";

export interface VariantKey {
  size: string;
  color?: string;
}

export interface InventoryDoc {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  variantKey: VariantKey;
  qtyTotal: number;
  qtyAvailable: number;
  qtyInCleaning: number;
  qtyInRepair: number;
  qtyLost: number;
  warehouseLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariantKeySchema = new Schema<VariantKey>(
  {
    size: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
  },
  { _id: false }
);

const InventorySchema = new Schema<InventoryDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    variantKey: { type: VariantKeySchema, required: true },
    qtyTotal: { type: Number, required: true, min: 0 },
    qtyAvailable: { type: Number, required: true, min: 0 },
    qtyInCleaning: { type: Number, default: 0, min: 0 },
    qtyInRepair: { type: Number, default: 0, min: 0 },
    qtyLost: { type: Number, default: 0, min: 0 },
    warehouseLocation: { type: String, trim: true },
  },
  { timestamps: true }
);

InventorySchema.index({ productId: 1, "variantKey.size": 1, "variantKey.color": 1 });

export const InventoryModel = model<InventoryDoc>("Inventory", InventorySchema);
