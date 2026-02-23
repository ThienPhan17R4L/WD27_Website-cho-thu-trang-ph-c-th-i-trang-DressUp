import { InventoryModel } from "../models/Inventory";
import { ProductModel } from "../models/Product";
import { OrderModel } from "../models/Order";
import { BadRequestError, NotFoundError } from "../utils/errors";

/**
 * Helper: Calculate reserved/rented quantity for a product variant
 * Counts items in active orders (pending_payment, confirmed, picking, shipping, delivered, renting, returned, inspecting)
 */
async function getReservedQuantity(productId: string, size: string, color?: string): Promise<number> {
  const activeStatuses = [
    "pending_payment", // Chờ thanh toán - giữ hàng
    "confirmed",       // Đã xác nhận - giữ hàng
    "picking",         // Đang lấy hàng
    "shipping",        // Đang giao
    "delivered",       // Đã giao (chưa kích hoạt)
    "renting",         // Đang thuê
    "returned",        // Đã trả (chưa kiểm tra)
    "inspecting",      // Đang kiểm tra
  ];

  const orders = await OrderModel.find({
    status: { $in: activeStatuses },
    "items.productId": productId,
  }).lean();

  let reservedQty = 0;
  for (const order of orders) {
    for (const item of order.items) {
      if (
        item.productId.toString() === productId &&
        item.variant?.size === size &&
        (!color || item.variant?.color === color)
      ) {
        reservedQty += item.quantity;
      }
    }
  }

  return reservedQty;
}

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

  /** Create inventory for a product variant and add initial stock */
  async createInventoryForVariant(productId: string, size: string, color: string | undefined, initialQty: number) {
    if (initialQty < 0) throw new BadRequestError("INVALID_QTY", "Quantity cannot be negative");

    // Check if product exists
    const product = await ProductModel.findById(productId);
    if (!product) throw new NotFoundError("PRODUCT_NOT_FOUND", "Product not found");

    // Check if variant exists in product
    const variant = product.variants?.find((v: any) =>
      v.size === size && (v.color || "") === (color || "")
    );
    if (!variant) {
      throw new NotFoundError("VARIANT_NOT_FOUND", `Variant ${size}${color ? ` - ${color}` : ""} not found in product`);
    }

    // Check if inventory already exists for this variant
    const existing = await InventoryModel.findOne({
      productId,
      "variantKey.size": size,
      "variantKey.color": color || { $exists: false },
    });

    if (existing) {
      throw new BadRequestError("INVENTORY_EXISTS", "Inventory already exists for this variant");
    }

    // Create inventory record
    const sku = (variant as any).sku || `${productId}-${size}${color ? `-${color}` : ""}`;

    const variantKey: { size: string; color?: string } = { size };
    if (color) {
      variantKey.color = color;
    }

    const inventory = await InventoryModel.create({
      productId,
      sku,
      variantKey,
      qtyTotal: initialQty,
      qtyAvailable: initialQty,
      qtyInCleaning: 0,
      qtyInRepair: 0,
      qtyLost: 0,
    });

    return inventory;
  },

  /** Add stock to existing inventory */
  async addStock(id: string, qty: number) {
    if (qty <= 0) throw new BadRequestError("INVALID_QTY", "Quantity must be positive");

    const inventory = await InventoryModel.findById(id);
    if (!inventory) throw new NotFoundError("INVENTORY_NOT_FOUND", "Inventory not found");

    inventory.qtyTotal += qty;
    inventory.qtyAvailable += qty;
    await inventory.save();
    return inventory;
  },

  /** Remove stock from inventory */
  async removeStock(id: string, qty: number) {
    if (qty <= 0) throw new BadRequestError("INVALID_QTY", "Quantity must be positive");

    const inventory = await InventoryModel.findById(id);
    if (!inventory) throw new NotFoundError("INVENTORY_NOT_FOUND", "Inventory not found");

    if (qty > inventory.qtyAvailable) {
      throw new BadRequestError(
        "INSUFFICIENT_STOCK",
        `Cannot remove ${qty}. Only ${inventory.qtyAvailable} available.`
      );
    }

    inventory.qtyTotal -= qty;
    inventory.qtyAvailable -= qty;
    await inventory.save();
    return inventory;
  },

  /** Mark items as cleaned (move from qtyInCleaning to qtyAvailable) */
  async markCleaned(id: string, qty: number) {
    if (qty <= 0) throw new BadRequestError("INVALID_QTY", "Quantity must be positive");

    const inventory = await InventoryModel.findById(id);
    if (!inventory) throw new NotFoundError("INVENTORY_NOT_FOUND", "Inventory not found");

    if (qty > inventory.qtyInCleaning) {
      throw new BadRequestError(
        "INVALID_QTY",
        `Cannot mark ${qty} as cleaned. Only ${inventory.qtyInCleaning} in cleaning.`
      );
    }

    inventory.qtyInCleaning -= qty;
    inventory.qtyAvailable += qty;
    await inventory.save();
    return inventory;
  },

  /** Mark items as repaired (move from qtyInRepair to qtyAvailable) */
  async markRepaired(id: string, qty: number) {
    if (qty <= 0) throw new BadRequestError("INVALID_QTY", "Quantity must be positive");

    const inventory = await InventoryModel.findById(id);
    if (!inventory) throw new NotFoundError("INVENTORY_NOT_FOUND", "Inventory not found");

    if (qty > inventory.qtyInRepair) {
      throw new BadRequestError(
        "INVALID_QTY",
        `Cannot mark ${qty} as repaired. Only ${inventory.qtyInRepair} in repair.`
      );
    }

    inventory.qtyInRepair -= qty;
    inventory.qtyAvailable += qty;
    await inventory.save();
    return inventory;
  },

  /** Mark items as broken (move from qtyAvailable to qtyLost) */
  async markBroken(id: string, qty: number) {
    if (qty <= 0) throw new BadRequestError("INVALID_QTY", "Quantity must be positive");

    const inventory = await InventoryModel.findById(id);
    if (!inventory) throw new NotFoundError("INVENTORY_NOT_FOUND", "Inventory not found");

    if (qty > inventory.qtyAvailable) {
      throw new BadRequestError(
        "INSUFFICIENT_STOCK",
        `Cannot mark ${qty} as broken. Only ${inventory.qtyAvailable} available.`
      );
    }

    inventory.qtyAvailable -= qty;
    inventory.qtyLost += qty;
    await inventory.save();
    return inventory;
  },

  /** Get inventory grouped by product - Shows ALL products and variants */
  async getInventoryGroupedByProduct(params: { page: number; limit: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;

    // Build product filter
    const productFilter: any = {};
    if (search) {
      productFilter.name = { $regex: search, $options: "i" };
    }

    // Get total count of products
    const total = await ProductModel.countDocuments(productFilter);

    // Get paginated products
    const skip = (page - 1) * limit;
    const products = await ProductModel.find(productFilter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // For each product, get all inventory records
    const data = await Promise.all(
      products.map(async (product: any) => {
        const productId = product._id.toString();

        // Get all inventory records for this product
        const inventoryRecords = await InventoryModel.find({ productId }).lean();

        // Create a map of existing inventory by variant key
        const inventoryMap = new Map();
        inventoryRecords.forEach((inv: any) => {
          const key = `${inv.variantKey.size}-${inv.variantKey.color || ""}`;
          inventoryMap.set(key, inv);
        });

        // Process all variants from product
        const variants = await Promise.all(
          (product.variants || []).map(async (variant: any) => {
            const key = `${variant.size}-${variant.color || ""}`;
            const inventory = inventoryMap.get(key);

            // Calculate reserved quantity (items in active orders)
            const reservedQty = await getReservedQuantity(
              productId,
              variant.size,
              variant.color
            );

            if (inventory) {
              // Variant has inventory record
              // Real available = qtyAvailable in DB - reserved in active orders
              const realAvailable = Math.max(0, (inventory.qtyAvailable || 0) - reservedQty);

              return {
                _id: inventory._id.toString(),
                sku: inventory.sku,
                size: variant.size,
                color: variant.color,
                qtyTotal: inventory.qtyTotal || 0,
                qtyAvailable: realAvailable, // ← Real available quantity
                qtyInCleaning: inventory.qtyInCleaning || 0,
                qtyInRepair: inventory.qtyInRepair || 0,
                qtyLost: inventory.qtyLost || 0,
                qtyReserved: reservedQty, // ← Show reserved quantity for admin
              };
            } else {
              // Variant has no inventory - return placeholder with 0 quantities
              return {
                _id: null, // No inventory ID yet
                sku: variant.sku || `${product._id}-${variant.size}${variant.color ? `-${variant.color}` : ""}`,
                size: variant.size,
                color: variant.color,
                qtyTotal: 0,
                qtyAvailable: 0,
                qtyInCleaning: 0,
                qtyInRepair: 0,
                qtyLost: 0,
                qtyReserved: 0,
              };
            }
          })
        );

        // Calculate totals
        const totalQty = variants.reduce((sum: number, v: any) => sum + v.qtyTotal, 0);
        const availableQty = variants.reduce((sum: number, v: any) => sum + v.qtyAvailable, 0);

        return {
          _id: productId,
          productName: product.name,
          productImage: product.images?.[0] || null,
          productSlug: product.slug,
          totalQty,
          availableQty,
          variants,
        };
      })
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};
