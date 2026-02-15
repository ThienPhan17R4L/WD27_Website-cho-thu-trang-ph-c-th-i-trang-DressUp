import { Schema, model, Types } from "mongoose";

export interface AddressDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  label: string;
  receiverName: string;
  receiverPhone: string;
  line1: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<AddressDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    label: { type: String, default: "Home", trim: true },
    receiverName: { type: String, required: true, trim: true },
    receiverPhone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    country: { type: String, default: "VN" },
    postalCode: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AddressSchema.index({ userId: 1, isDefault: 1 });

export const AddressModel = model<AddressDoc>("Address", AddressSchema);
