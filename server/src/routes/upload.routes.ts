import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { uploadMiddleware } from "../middlewares/upload";
import { uploadController } from "../controllers/upload.controller";

export const uploadRouter = Router();

uploadRouter.post(
  "/image",
  requireAuth,
  requireAdmin,
  uploadMiddleware.single("image"),
  uploadController.uploadImage
);

uploadRouter.delete(
  "/image",
  requireAuth,
  requireAdmin,
  uploadController.deleteImage
);
