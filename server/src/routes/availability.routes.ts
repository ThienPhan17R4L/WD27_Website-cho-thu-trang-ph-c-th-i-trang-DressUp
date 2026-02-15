import { Router } from "express";
import { availabilityController } from "../controllers/availability.controller";

export const availabilityRouter = Router();

// Public endpoints
availabilityRouter.get("/:productId", availabilityController.check);
availabilityRouter.get("/:productId/calendar", availabilityController.calendar);
