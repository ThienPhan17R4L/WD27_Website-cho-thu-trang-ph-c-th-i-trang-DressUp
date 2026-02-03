import type { Request, Response } from "express";
import { CategoryService } from "../services/category.service";

export const CategoryController = {
  async create(req: Request, res: Response) {
    const doc = await CategoryService.create(req.body);
    return res.status(201).json(doc);
  },

  async list(req: Request, res: Response) {
    const data = await CategoryService.list(req.query as any);
    return res.json(data);
  },

  async tree(req: Request, res: Response) {
    const isActive = req.query.isActive !== undefined ? (req.query.isActive === "true") : undefined;
    const data = await CategoryService.tree(isActive);
    return res.json(data);
  },

  async getById(req: Request, res: Response) {
    const doc = await CategoryService.getById(req.params.id as string);
    return res.json(doc);
  },

  async getBySlug(req: Request, res: Response) {
    const doc = await CategoryService.getBySlug(req.params.slug as string);
    return res.json(doc);
  },

  async update(req: Request, res: Response) {
    const doc = await CategoryService.update(req.params.id as string, req.body);
    return res.json(doc);
  },

  async remove(req: Request, res: Response) {
    const doc = await CategoryService.remove(req.params.id as string);
    return res.json({ message: "Deleted", deleted: doc });
  },
};
