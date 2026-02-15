import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate";
import { profileController } from "../controllers/profile.controller";
import { updateProfileSchema, changePasswordSchema } from "../schemas/profile.schema";

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get("/", profileController.getProfile);
profileRouter.patch("/", validateBody(updateProfileSchema), profileController.updateProfile);
profileRouter.post("/change-password", validateBody(changePasswordSchema), profileController.changePassword);
