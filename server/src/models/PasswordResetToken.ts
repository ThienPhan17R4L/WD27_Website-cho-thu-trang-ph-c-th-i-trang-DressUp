import { Schema, model, Types } from "mongoose";

export interface PasswordResetTokenDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<PasswordResetTokenDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index: auto-delete expired tokens after 24 hours
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

export const PasswordResetTokenModel = model<PasswordResetTokenDoc>(
  "PasswordResetToken",
  PasswordResetTokenSchema
);
