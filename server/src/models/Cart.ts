import { Schema, model, Types } from "mongoose";

export interface CartItem {
  productId: Types.ObjectId;

  name: string;                 // snapshot
  image?: string;               // snapshot

  rental: {
    label: string;              // "3 days"
    days: number;
    price: number;              // VND (snapshot)
  };

  variant?: {
    size: string;
    color?: string;
  };

  deposit: number;              // snapshot
  quantity: number;             // default 1
}

export interface CartDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: CartItem[];

  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<CartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },

    name: { type: String, required: true },
    image: { type: String },

    rental: {
      label: { type: String, required: true },
      days: { type: Number, required: true },
      price: { type: Number, required: true },
    },

    variant: {
      size: { type: String },
      color: { type: String },
    },

    deposit: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const CartSchema = new Schema<CartDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export const CartModel = model<CartDoc>("Cart", CartSchema);
