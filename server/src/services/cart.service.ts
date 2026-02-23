import { HttpError } from "../middlewares/errorHandler";
import { CartRepository } from "../repositories/cart.repo";
import { ProductRepository } from "../repositories/product.repo";
import { Types } from "mongoose";
import { env } from "../config/env";

const cartRepo = new CartRepository();
const productRepo = new ProductRepository();

function calculateRentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) throw new HttpError(400, "End date must be after start date");
  return days;
}

function findRentalPrice(product: any, days: number): number {
  if (!product.rentalTiers || product.rentalTiers.length === 0) {
    throw new HttpError(400, "No rental tiers available for this product");
  }

  const sorted = [...product.rentalTiers].sort((a, b) => a.days - b.days);

  // Find the highest tier where tier.days <= rental days (price decreases with more days)
  // Example: tiers = [{days:1,price:100}, {days:3,price:80}, {days:7,price:60}]
  // If renting 5 days -> use tier {days:3,price:80} -> total = 5 * 80
  const tier = [...sorted].reverse().find(t => t.days <= days) || sorted[0];

  if (!tier) throw new HttpError(400, "No rental tier available");

  console.log(`[findRentalPrice] Product: ${product.name}, Days: ${days}, Tier: ${tier.days} days, Price/day: ${tier.price}`);

  return tier.price;
}

export const CartService = {
  async getCart(userId: string) {
    let cart = await cartRepo.getByUserId(userId);
    if (!cart) cart = await cartRepo.createForUser(userId);

    const items = cart.items.map((item: any) => {
      // Convert Mongoose subdocument to plain object
      const plainItem = item.toObject ? item.toObject() : item;

      const lineTotal = plainItem.rental.days * plainItem.rental.price * plainItem.quantity;

      console.log(`[Cart Item] ${plainItem.name}: days=${plainItem.rental.days}, price/day=${plainItem.rental.price}, qty=${plainItem.quantity}, lineTotal=${lineTotal}`);

      return {
        _id: plainItem._id || new Types.ObjectId(),
        productId: plainItem.productId,
        name: plainItem.name,
        image: plainItem.image,
        rental: plainItem.rental,
        variant: plainItem.variant,
        deposit: plainItem.deposit,
        quantity: plainItem.quantity,
        lineTotal,
        pricePerDay: plainItem.rental.price,
      };
    });

    const subtotal = items.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
    const discount = 0;
    const shippingFee = 0;
    const serviceFee = Math.round(subtotal * (env.SERVICE_FEE_PERCENT / 100));
    const grandTotal = subtotal - discount + shippingFee + serviceFee;

    return {
      _id: cart._id,
      userId: cart.userId,
      items,
      totals: {
        itemCount: items.length,
        subtotal,
        discount,
        shippingFee,
        serviceFee,
        grandTotal,
      },
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  },

  async addItem(userId: string, payload: any) {
    console.log('[Cart] ========================================');
    console.log('[Cart] ADD ITEM TO CART');
    console.log('[Cart] ========================================');
    console.log('[Cart] Payload received:', JSON.stringify(payload, null, 2));
    console.log('[Cart] Payload.rentalStart:', payload.rentalStart);
    console.log('[Cart] Payload.rentalEnd:', payload.rentalEnd);

    const product = await productRepo.findById(payload.productId);
    if (!product) throw new HttpError(404, "Product not found");

    const days = calculateRentalDays(payload.rentalStart, payload.rentalEnd);
    const pricePerDay = findRentalPrice(product, days);

    console.log('[Cart] Calculated - Days:', days, 'Price/day:', pricePerDay);

    let cart = await cartRepo.getByUserId(userId);
    if (!cart) cart = await cartRepo.createForUser(userId);

    // Find existing item with same product, variant, AND rental dates
    const existed = cart.items.find(
      (i: any) => {
        // Check basic fields
        if (i.productId.toString() !== payload.productId) return false;
        if (i.variant?.size !== payload.variant?.size) return false;

        // Safe check for rental dates
        if (!i.rental?.startDate || !i.rental?.endDate) return false;

        const existingStart = i.rental.startDate.toISOString().split('T')[0];
        const existingEnd = i.rental.endDate.toISOString().split('T')[0];

        return existingStart === payload.rentalStart && existingEnd === payload.rentalEnd;
      }
    );

    if (existed) {
      console.log(`[Cart] Found existing item, merging quantity: ${existed.quantity} + ${payload.quantity}`);
      existed.quantity += payload.quantity;
    } else {
      console.log(`[Cart] Creating new item with rental dates: ${payload.rentalStart} to ${payload.rentalEnd}`);
      const newItem: any = {
        _id: new Types.ObjectId(),
        productId: product._id,
        name: product.name,
        rental: {
          startDate: new Date(payload.rentalStart),
          endDate: new Date(payload.rentalEnd),
          days,
          price: pricePerDay,
        },
        variant: payload.variant,
        deposit: product.depositDefault,
        quantity: payload.quantity,
      };

      console.log('[Cart] New item object created:');
      console.log('[Cart]   - rental.startDate:', newItem.rental.startDate);
      console.log('[Cart]   - rental.endDate:', newItem.rental.endDate);
      console.log('[Cart]   - rental.days:', newItem.rental.days);

      if (product.images && product.images[0]) {
        newItem.image = product.images[0];
      }

      console.log('[Cart] Pushing item to cart.items array...');
      cart.items.push(newItem);
      console.log(`[Cart] New item added. Total items: ${cart.items.length}`);
      const lastItem = cart.items[cart.items.length - 1];
      if (lastItem) {
        console.log('[Cart] Last item in array:', lastItem.rental);
      }
    }

    await cartRepo.save(cart);
    console.log(`[Cart] Cart saved. Verifying rental dates...`);
    cart.items.forEach((item: any, i: number) => {
      console.log(`  Item ${i}: ${item.name} - Start: ${item.rental?.startDate}, End: ${item.rental?.endDate}`);
    });

    // Return formatted cart with plain objects
    return this.getCart(userId);
  },

  async updateItem(userId: string, itemId: string, updates: any) {
    const cart = await cartRepo.getByUserId(userId);
    if (!cart) throw new HttpError(404, "Cart not found");

    const item = cart.items.find((i: any) => i._id.toString() === itemId);
    if (!item) throw new HttpError(404, "Item not found in cart");

    if (updates.quantity !== undefined) {
      item.quantity = updates.quantity;
    }

    if (updates.rentalStart && updates.rentalEnd) {
      const product = await productRepo.findById(item.productId.toString());
      if (!product) throw new HttpError(404, "Product not found");

      const days = calculateRentalDays(updates.rentalStart, updates.rentalEnd);
      const pricePerDay = findRentalPrice(product, days);

      item.rental.startDate = new Date(updates.rentalStart);
      item.rental.endDate = new Date(updates.rentalEnd);
      item.rental.days = days;
      item.rental.price = pricePerDay;
    }

    if (updates.variant) {
      item.variant = updates.variant;
    }

    await cartRepo.save(cart);
    return this.getCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await cartRepo.getByUserId(userId);
    if (!cart) throw new HttpError(404, "Cart not found");

    cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);

    await cartRepo.save(cart);
    return this.getCart(userId);
  },

  async clear(userId: string) {
    await cartRepo.clear(userId);
    return this.getCart(userId);
  },
};
