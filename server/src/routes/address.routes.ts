import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate";
import { addressController } from "../controllers/address.controller";
import { createAddressSchema, updateAddressSchema } from "../schemas/address.schema";

export const addressRouter = Router();

addressRouter.use(requireAuth);

addressRouter.get("/", addressController.list);
addressRouter.post("/", validateBody(createAddressSchema), addressController.create);
addressRouter.patch("/:id", validateBody(updateAddressSchema), addressController.update);
addressRouter.delete("/:id", addressController.remove);
addressRouter.patch("/:id/default", addressController.setDefault);
