import { Request, Response, NextFunction } from "express";
import { InventoryModel } from "../models/Inventory";
import { NotFoundError } from "../utils/errors";
import { auditService } from "../services/audit.service";
import { InventoryService } from "../services/inventory.service";

export const inventoryController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {};
      if (req.query.productId) filter.productId = req.query.productId;
      if (req.query.sku) filter.sku = { $regex: req.query.sku, $options: "i" };

      const [data, total] = await Promise.all([
        InventoryModel.find(filter)
          .populate("productId", "name images slug")
          .sort({ sku: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        InventoryModel.countDocuments(filter),
      ]);

      // Rename populated productId → product so client can use item.product.name
      const enriched = data.map((item: any) => {
        const { productId, ...rest } = item;
        return { ...rest, productId: productId?._id ?? productId, product: productId };
      });
      return res.json({ data: enriched, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (e) {
      next(e);
    }
  },

  getByProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await InventoryModel.find({ productId: String(req.params.productId) }).lean();
      return res.json({ data });
    } catch (e) {
      next(e);
    }
  },

  adjust: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { qtyTotal, qtyAvailable, qtyInCleaning, qtyInRepair, qtyLost } = req.body;
      const userId = (req as any).user!.id;

      const inventory = await InventoryModel.findById(String(id));
      if (!inventory) throw new NotFoundError("INVENTORY_NOT_FOUND", "Inventory not found");

      const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];

      if (qtyTotal !== undefined) {
        changes.push({ field: "qtyTotal", oldValue: inventory.qtyTotal, newValue: qtyTotal });
        inventory.qtyTotal = qtyTotal;
      }
      if (qtyAvailable !== undefined) {
        changes.push({ field: "qtyAvailable", oldValue: inventory.qtyAvailable, newValue: qtyAvailable });
        inventory.qtyAvailable = qtyAvailable;
      }
      if (qtyInCleaning !== undefined) {
        changes.push({ field: "qtyInCleaning", oldValue: inventory.qtyInCleaning, newValue: qtyInCleaning });
        inventory.qtyInCleaning = qtyInCleaning;
      }
      if (qtyInRepair !== undefined) {
        changes.push({ field: "qtyInRepair", oldValue: inventory.qtyInRepair, newValue: qtyInRepair });
        inventory.qtyInRepair = qtyInRepair;
      }
      if (qtyLost !== undefined) {
        changes.push({ field: "qtyLost", oldValue: inventory.qtyLost, newValue: qtyLost });
        inventory.qtyLost = qtyLost;
      }

      await inventory.save();

      if (changes.length > 0) {
        await auditService.log("Inventory", String(id), "stock_adjustment", userId, changes);
      }

      return res.json({ data: inventory });
    } catch (e) {
      next(e);
    }
  },

  createForVariant: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, size, color, initialQty } = req.body;
      const inventory = await InventoryService.createInventoryForVariant(
        productId,
        size,
        color,
        initialQty || 0
      );
      return res.json(inventory);
    } catch (e) {
      next(e);
    }
  },

  addStock: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { qty } = req.body;
      const inventory = await InventoryService.addStock(id, qty);
      return res.json(inventory);
    } catch (e) {
      next(e);
    }
  },

  removeStock: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { qty } = req.body;
      const inventory = await InventoryService.removeStock(id, qty);
      return res.json(inventory);
    } catch (e) {
      next(e);
    }
  },

  markCleaned: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { qty } = req.body;
      const inventory = await InventoryService.markCleaned(id, qty);
      return res.json(inventory);
    } catch (e) {
      next(e);
    }
  },

  markRepaired: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { qty } = req.body;
      const inventory = await InventoryService.markRepaired(id, qty);
      return res.json(inventory);
    } catch (e) {
      next(e);
    }
  },

  markBroken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { qty } = req.body;
      const inventory = await InventoryService.markBroken(id, qty);
      return res.json(inventory);
    } catch (e) {
      next(e);
    }
  },

  getGrouped: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const search = req.query.search ? String(req.query.search) : undefined;

      const params: { page: number; limit: number; search?: string } = { page, limit };
      if (search) {
        params.search = search;
      }

      const result = await InventoryService.getInventoryGroupedByProduct(params);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
