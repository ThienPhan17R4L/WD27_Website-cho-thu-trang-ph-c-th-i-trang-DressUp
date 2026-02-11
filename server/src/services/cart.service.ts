import { HttpError } from "../middlewares/errorHanler";
import { CartRepository } from "../repositories/cart.repo";
import { ProductRepository } from "../repositories/product.repo";
import { Types } from "mongoose";

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
      const lineTotal = item.rental.days * item.rental.price * item.quantity;

      console.log(`[Cart Item] ${item.name}: days=${item.rental.days}, price/day=${item.rental.price}, qty=${item.quantity}, lineTotal=${lineTotal}`);

      return {
        ...item,
        _id: item._id || new Types.ObjectId(),
        lineTotal,
        pricePerDay: item.rental.price,
      };
    });

    const subtotal = items.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
    const discount = 0;
    const shippingFee = 0;
    const grandTotal = subtotal - discount + shippingFee;

    return {
      _id: cart._id,
      userId: cart.userId,
      items,
      totals: {
        itemCount: items.length,
        subtotal,
        discount,
        shippingFee,
        grandTotal,
      },
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  },

  async addItem(userId: string, payload: any) {
    const product = await productRepo.findById(payload.productId);
    if (!product) throw new HttpError(404, "Product not found");

    const days = calculateRentalDays(payload.rentalStart, payload.rentalEnd);
    const pricePerDay = findRentalPrice(product, days);

    let cart = await cartRepo.getByUserId(userId);
    if (!cart) cart = await cartRepo.createForUser(userId);

    const existed = cart.items.find(
      (i: any) =>
        i.productId.toString() === payload.productId &&
        i.variant?.size === payload.variant?.size &&
        i.rental.startDate.toISOString().split('T')[0] === payload.rentalStart &&
        i.rental.endDate.toISOString().split('T')[0] === payload.rentalEnd
    );

    if (existed) {
      existed.quantity += payload.quantity;
    } else {
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

      if (product.images && product.images[0]) {
        newItem.image = product.images[0];
      }

      cart.items.push(newItem);
    }

    return cartRepo.save(cart);
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

    return cartRepo.save(cart);
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await cartRepo.getByUserId(userId);
    if (!cart) throw new HttpError(404, "Cart not found");

    cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);

    return cartRepo.save(cart);
  },

  async clear(userId: string) {
    return cartRepo.clear(userId);
  },
};
