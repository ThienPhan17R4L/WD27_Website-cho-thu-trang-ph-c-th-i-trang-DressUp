import { Types } from "mongoose";
import { CartModel } from "../models/Cart";

export class CartRepository {
  async getByUserId(userId: string) {
    return CartModel.findOne({ userId }).lean();
  }

  async createForUser(userId: string) {
    return CartModel.create({
      userId: new Types.ObjectId(userId),
      items: [],
    });
  }

  async save(cart: any) {
    return CartModel.findByIdAndUpdate(cart._id, cart, {
      new: true,
    }).lean();
  }

  async clear(userId: string) {
    return CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    ).lean();
  }
}
