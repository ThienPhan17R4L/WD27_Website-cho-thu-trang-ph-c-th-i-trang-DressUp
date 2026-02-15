import { Schema, model, Types } from "mongoose";

export interface PaymentDoc {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  method: "cod" | "momo" | "vnpay" | "zalopay" | "mock";
  amount: number;
  status: "pending" | "processing" | "paid" | "failed" | "refunded";
  gatewayTransactionId?: string;
  gatewayResponse?: unknown;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<PaymentDoc>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    method: {
      type: String,
      enum: ["cod", "momo", "vnpay", "zalopay", "mock"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed", "refunded"],
      default: "pending",
    },
    gatewayTransactionId: { type: String },
    gatewayResponse: { type: Schema.Types.Mixed },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

PaymentSchema.index({ orderId: 1, status: 1 });

export const PaymentModel = model<PaymentDoc>("Payment", PaymentSchema);
