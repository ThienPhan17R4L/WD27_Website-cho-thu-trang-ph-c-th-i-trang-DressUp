import type { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { StringValue } from "ms";

export const ProductController = {
  async create(req: Request, res: Response) {
    const doc = await ProductService.create(req.body);
    return res.status(201).json(doc);
  },

  async list(req: Request, res: Response) {
    const data = await ProductService.list(req.query as any);
    return res.json(data);
  },

  async getById(req: Request, res: Response) {
    const doc = await ProductService.getById(req.params.id as StringValue);
    return res.json(doc);
  },

  async getBySlug(req: Request, res: Response) {
    const doc = await ProductService.getBySlug(req.params.slug as StringValue);
    return res.json(doc);
  },

  async update(req: Request, res: Response) {
    const doc = await ProductService.update(req.params.id as StringValue, req.body);
    return res.json(doc);
  },

  async remove(req: Request, res: Response) {
    const doc = await ProductService.remove(req.params.id as StringValue);
    return res.json({ message: "Deleted", deleted: doc });
  },
};
