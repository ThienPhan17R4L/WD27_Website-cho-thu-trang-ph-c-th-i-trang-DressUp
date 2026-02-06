import { Schema, model, Types } from "mongoose";

export interface CartItem {
  _id?: Types.ObjectId;         // unique ID for each cart item
  productId: Types.ObjectId;

  name: string;                 // snapshot
  image?: string;               // snapshot

  rental: {
    startDate: Date;            // rental start date
    endDate: Date;              // rental end date
    days: number;               // computed rental days
    price: number;              // VND per day (snapshot)
  };

  variant?: {
    size: string;
    color?: string;
  };

  deposit: number;              // snapshot
  quantity: number;             // default 1

  // Computed fields (not stored in DB, only returned from API)
  lineTotal?: number;           // days * price * quantity
  pricePerDay?: number;         // = price
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
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },

    name: { type: String, required: true },
    image: { type: String },

    rental: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
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
  { _id: true }
);

const CartSchema = new Schema<CartDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export const CartModel = model<CartDoc>("Cart", CartSchema);
