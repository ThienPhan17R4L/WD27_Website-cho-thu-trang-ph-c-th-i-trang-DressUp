import { Schema, model, Types } from "mongoose";

export interface RefundDoc {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  returnId?: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  reason: "deposit_return" | "cancellation" | "partial_refund";
  status: "pending" | "processed" | "failed";
  processedAt?: Date;
  processedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const RefundSchema = new Schema<RefundDoc>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    returnId: { type: Schema.Types.ObjectId, ref: "Return" },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: {
      type: String,
      enum: ["deposit_return", "cancellation", "partial_refund"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },
    processedAt: { type: Date },
    processedBy: { type: Schema.Types.ObjectId, ref: "user" },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RefundModel = model<RefundDoc>("Refund", RefundSchema);
