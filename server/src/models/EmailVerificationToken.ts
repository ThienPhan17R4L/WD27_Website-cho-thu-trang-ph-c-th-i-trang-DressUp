import mongoose, { Schema, InferSchemaType } from "mongoose";

const EmailVerificationTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true
    },

    expiresAt: {
      type: Date,
      required: true
      // NOTE: không set index: true ở đây để tránh duplicate index
    },

    usedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

/**
 * Indexes
 */
EmailVerificationTokenSchema.index({ userId: 1 });

// TTL index: MongoDB sẽ tự xóa document khi expiresAt < now
EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Optional: nếu bạn hay query token "chưa dùng + chưa hết hạn"
EmailVerificationTokenSchema.index({ usedAt: 1, expiresAt: 1 });

/**
 * Types
 */
export type EmailVerificationTokenDoc = InferSchemaType<
  typeof EmailVerificationTokenSchema
> & {
  _id: mongoose.Types.ObjectId;
};

/**
 * Model
 */
export const EmailVerificationTokenModel =
  mongoose.models.EmailVerificationToken ||
  mongoose.model<EmailVerificationTokenDoc>("email_verification_token", EmailVerificationTokenSchema);
