import { Request, Response, NextFunction } from "express";
import { uploadService } from "../services/upload.service";
import { BadRequestError } from "../utils/errors";

export const uploadController = {
  uploadImage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as any).file;
      if (!file) throw new BadRequestError("NO_FILE", "No file uploaded");

      const result = await uploadService.uploadImage(file.buffer, "dressup");
      return res.status(201).json({ data: result });
    } catch (e) {
      next(e);
    }
  },

  deleteImage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.body;
      if (!publicId) throw new BadRequestError("MISSING_PUBLIC_ID", "publicId is required");

      await uploadService.deleteImage(publicId);
      return res.json({ message: "Image deleted" });
    } catch (e) {
      next(e);
    }
  },
};
