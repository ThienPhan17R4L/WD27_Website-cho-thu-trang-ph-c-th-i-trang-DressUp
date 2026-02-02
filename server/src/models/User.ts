import mongoose, { Schema, InferSchemaType } from "mongoose";

const AddressSchema = new Schema(
  {
    receiverName: { type: String, required: true, trim: true },
    receiverPhone: { type: String, required: true, trim: true },

    line1: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },

    country: { type: String, default: "VN" },
    postalCode: { type: String }
  },
  { _id: false } // embedded object → không cần _id
);

/**
 * ========= User Schema =========
 */
const UserSchema = new Schema(
  {
    // ===== AUTH =====
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    isEmailVerified: {
      type: Boolean
    },

    emailVerifiedAt: {
      type: Date
    },

    status: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "pending",
      index: true
    },

    roles: {
      type: [String],
      enum: ["user", "admin", "staff"],
      default: ["user"],
      index: true
    },

    // ===== PROFILE =====
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    avatarUrl: {
      type: String
    },

    dob: {
      type: Date
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    // ===== SINGLE ADDRESS =====
    address: {
      type: AddressSchema
    },

    // ===== OPTIONAL KYC =====
    identity: {
      idNumber: { type: String },
      verifiedAt: { type: Date }
    },

    // ===== SYSTEM =====
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

/**
 * ========= Types =========
 */
export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

/**
 * ========= Model =========
 */
export const UserModel =
  mongoose.models.User || mongoose.model<UserDoc>("user", UserSchema);
