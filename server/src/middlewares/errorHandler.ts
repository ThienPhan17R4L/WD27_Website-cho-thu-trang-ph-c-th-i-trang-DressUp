import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

export class HttpError extends Error {
  status: number;
  details?: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Mongoose duplicate key (e.g. slug unique)
  if (err?.code === 11000) {
    return res.status(409).json({
      message: "Duplicate key",
      details: err?.keyValue,
    });
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Validation error",
      details: err.errors,
    });
  }

  // Custom AppError (BadRequestError, UnauthorizedError, etc.)
  if (err instanceof AppError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Custom HttpError (for backward compatibility)
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      details: err.details,
    });
  }

  // Zod handled in validate middleware typically, but just in case
  if (err?.name === "ZodError") {
    return res.status(400).json({
      message: "Validation error",
      details: err?.issues,
    });
  }

  logger.error("Unhandled error", { error: err?.message, stack: err?.stack });
  return res.status(500).json({ message: "Internal server error" });
}
