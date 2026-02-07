import { InventoryModel } from "../models/Inventory";

export const InventoryService = {
  async checkAvailability(
    productId: string,
    size: string,
    color?: string,
    quantity: number = 1
  ): Promise<boolean> {
    const inventory = await InventoryModel.findOne({
      productId,
      "variantKey.size": size,
      ...(color ? { "variantKey.color": color } : {}),
    });

    if (!inventory) return false;
    return inventory.qtyAvailable >= quantity;
  },

  async reserveStock(
    productId: string,
    size: string,
    color: string | undefined,
    quantity: number
  ): Promise<void> {
    const result = await InventoryModel.updateOne(
      {
        productId,
        "variantKey.size": size,
        ...(color ? { "variantKey.color": color } : {}),
        qtyAvailable: { $gte: quantity },
      },
      {
        $inc: { qtyAvailable: -quantity },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error("Insufficient stock");
    }
  },

  async releaseStock(
    productId: string,
    size: string,
    color: string | undefined,
    quantity: number
  ): Promise<void> {
    await InventoryModel.updateOne(
      {
        productId,
        "variantKey.size": size,
        ...(color ? { "variantKey.color": color } : {}),
      },
      {
        $inc: { qtyAvailable: quantity },
      }
    );
  },
};
