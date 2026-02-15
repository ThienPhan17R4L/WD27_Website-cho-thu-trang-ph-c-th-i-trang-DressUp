import { Schema, model, Types } from "mongoose";

export interface RentalReservationDoc {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantKey: { size: string; color?: string };
  orderId?: Types.ObjectId;
  userId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  quantity: number;
  status: "hold" | "confirmed" | "released" | "expired";
  expiresAt?: Date;
  createdAt: Date;
}

const RentalReservationSchema = new Schema<RentalReservationDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantKey: {
      size: { type: String, required: true },
      color: { type: String },
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["hold", "confirmed", "released", "expired"],
      default: "hold",
    },
    expiresAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index for auto-expiring holds
RentalReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Query index for overlap detection
RentalReservationSchema.index({
  productId: 1,
  "variantKey.size": 1,
  "variantKey.color": 1,
  startDate: 1,
  endDate: 1,
  status: 1,
});

export const RentalReservationModel = model<RentalReservationDoc>(
  "RentalReservation",
  RentalReservationSchema
);
