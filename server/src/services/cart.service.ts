import { HttpError } from "../middlewares/errorHanler";
import { CartRepository } from "../repositories/cart.repo";
import { ProductRepository } from "../repositories/product.repo";

const cartRepo = new CartRepository();
const productRepo = new ProductRepository();

export const CartService = {
  async getCart(userId: string) {
    let cart = await cartRepo.getByUserId(userId);
    if (!cart) cart = await cartRepo.createForUser(userId);
    return cart;
  },

  async addItem(userId: string, payload: any) {
    const product = await productRepo.findById(payload.productId);
    if (!product) throw new HttpError(404, "Product not found");

    let cart = await cartRepo.getByUserId(userId);
    if (!cart) cart = await cartRepo.createForUser(userId);

    const existed = cart.items.find(
      (i: any) =>
        i.productId.toString() === payload.productId &&
        i.variant?.size === payload.variant?.size &&
        i.rental.days === payload.rental.days
    );

    if (existed) {
      existed.quantity += payload.quantity;
    } else {
      const image = product?.images[0];
      if (!image) {
        throw new Error("Product missing image"); // hoặc Errors.badRequest(...)
      }
      cart.items.push({
        productId: product._id,
        name: product.name,
        image,

        rental: payload.rental,
        variant: payload.variant,
        deposit: product.depositDefault,
        quantity: payload.quantity,
      });
    }

    return cartRepo.save(cart);
  },

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const cart = await cartRepo.getByUserId(userId);
    if (!cart) throw new HttpError(404, "Cart not found");

    const item = cart.items.find(
      (i: any) => i.productId.toString() === productId
    );
    if (!item) throw new HttpError(404, "Item not found in cart");

    item.quantity = quantity;
    return cartRepo.save(cart);
  },

  async removeItem(userId: string, productId: string) {
    const cart = await cartRepo.getByUserId(userId);
    if (!cart) throw new HttpError(404, "Cart not found");

    cart.items = cart.items.filter(
      (i: any) => i.productId.toString() !== productId
    );

    return cartRepo.save(cart);
  },

  async clear(userId: string) {
    return cartRepo.clear(userId);
  },
};
