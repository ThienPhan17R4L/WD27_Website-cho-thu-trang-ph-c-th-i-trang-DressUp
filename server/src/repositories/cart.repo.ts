import { Types } from "mongoose";
import { CartModel } from "../models/Cart";

export class CartRepository {
  async getByUserId(userId: string) {
    // Don't use .lean() - return Mongoose document for proper modification
    return CartModel.findOne({ userId });
  }

  async createForUser(userId: string) {
    return CartModel.create({
      userId: new Types.ObjectId(userId),
      items: [],
    });
  }

  async save(cart: any) {
    console.log('[CartRepo] ========================================');
    console.log('[CartRepo] SAVING CART');
    console.log('[CartRepo] ========================================');
    console.log('[CartRepo] Cart ID:', cart._id);
    console.log('[CartRepo] Items count:', cart.items?.length);
    console.log('[CartRepo] Is Mongoose document?', !!(cart.save && typeof cart.save === 'function'));

    // If it's a Mongoose document, use .save()
    if (cart.save && typeof cart.save === 'function') {
      console.log('[CartRepo] Using Mongoose .save() method...');

      // Log items before save
      console.log('[CartRepo] Items before save:');
      cart.items.forEach((item: any, i: number) => {
        console.log(`  [${i}] ${item.name}: rental.startDate=${item.rental?.startDate}, endDate=${item.rental?.endDate}`);
      });

      await cart.save();
      console.log('[CartRepo] ✅ Saved successfully using .save()');

      // Log items after save
      console.log('[CartRepo] Items after save:');
      cart.items.forEach((item: any, i: number) => {
        console.log(`  [${i}] ${item.name}: rental.startDate=${item.rental?.startDate}, endDate=${item.rental?.endDate}`);
      });

      return cart;
    }

    // Otherwise, use findByIdAndUpdate with $set for nested arrays
    console.log('[CartRepo] Using findByIdAndUpdate...');
    const result = await CartModel.findByIdAndUpdate(
      cart._id,
      { $set: { items: cart.items } },
      { new: true }
    );
    console.log('[CartRepo] ✅ Saved successfully using findByIdAndUpdate');
    return result;
  }

  async clear(userId: string) {
    return CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );
  }
}
