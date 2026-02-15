import { VariantModel } from "../models/Variant";
import { ProductModel } from "../models/Product";
import { InventoryModel } from "../models/Inventory";
import { NotFoundError } from "../utils/errors";
import type { CreateVariantInput, UpdateVariantInput } from "../schemas/variant.schema";

export const variantService = {
  async listByProduct(productId: string) {
    return VariantModel.find({ productId }).sort({ size: 1, color: 1 });
  },

  async create(productId: string, data: CreateVariantInput) {
    const product = await ProductModel.findById(productId);
    if (!product) throw new NotFoundError("PRODUCT_NOT_FOUND", "Product not found");

    const variant = await VariantModel.create({
      productId,
      ...data,
      sku: data.sku.toUpperCase(),
    } as any);

    // Auto-create inventory record for this variant
    const existingInv = await InventoryModel.findOne({ sku: variant.sku });
    if (!existingInv) {
      await InventoryModel.create({
        productId,
        sku: variant.sku,
        variantKey: { size: variant.size, color: variant.color },
        qtyTotal: 0,
        qtyAvailable: 0,
      } as any);
    }

    return variant;
  },

  async update(variantId: string, data: UpdateVariantInput) {
    const variant = await VariantModel.findByIdAndUpdate(
      variantId,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!variant) throw new NotFoundError("VARIANT_NOT_FOUND", "Variant not found");
    return variant;
  },

  async remove(variantId: string) {
    const variant = await VariantModel.findByIdAndDelete(variantId);
    if (!variant) throw new NotFoundError("VARIANT_NOT_FOUND", "Variant not found");
    return { ok: true };
  },

  async getById(variantId: string) {
    const variant = await VariantModel.findById(variantId);
    if (!variant) throw new NotFoundError("VARIANT_NOT_FOUND", "Variant not found");
    return variant;
  },
};
