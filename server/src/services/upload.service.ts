import { getCloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { logger } from "../utils/logger";

interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadService = {
  async uploadImage(fileBuffer: Buffer, folder: string = "dressup"): Promise<UploadResult> {
    if (!isCloudinaryConfigured()) {
      // Dev fallback: return a placeholder
      const fakeId = `local_${Date.now()}`;
      logger.warn("Cloudinary not configured, using placeholder", { fakeId });
      return {
        url: `https://placehold.co/600x800?text=Upload+${fakeId}`,
        publicId: fakeId,
      };
    }

    const cloudinary = getCloudinary();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 1200, height: 1600, crop: "limit", quality: "auto" }],
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      stream.end(fileBuffer);
    });
  },

  async deleteImage(publicId: string): Promise<void> {
    if (!isCloudinaryConfigured()) {
      logger.warn("Cloudinary not configured, skipping delete", { publicId });
      return;
    }

    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicId);
  },
};
