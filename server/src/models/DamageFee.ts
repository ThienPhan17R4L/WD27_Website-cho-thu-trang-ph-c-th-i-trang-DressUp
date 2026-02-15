import { Schema, model, Types } from "mongoose";

export interface DamageFeeDoc {
  _id: Types.ObjectId;
  returnId: Types.ObjectId;
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  description: string;
  amount: number;
  images?: string[];
  assessedBy: Types.ObjectId;
  createdAt: Date;
}

const DamageFeeSchema = new Schema<DamageFeeDoc>(
  {
    returnId: { type: Schema.Types.ObjectId, ref: "Return", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    assessedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DamageFeeModel = model<DamageFeeDoc>("DamageFee", DamageFeeSchema);
