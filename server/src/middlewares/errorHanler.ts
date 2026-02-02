import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/errors";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // AppError (our controlled errors)
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null
      }
    });
  }

  // Mongoose duplicate key -> email exists race condition
  if (err && typeof err === "object" && (err as any).code === 11000) {
    const keys = (err as any).keyPattern ?? {};
    const field = Object.keys(keys)[0] ?? "field";
    return res.status(409).json({
      error: {
        code: "DUPLICATE_KEY",
        message: `Duplicate ${field}`,
        details: null
      }
    });
  }

  // Mongoose validation (should not happen often if zod is used)
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: { code: "MONGO_VALIDATION", message: err.message, details: null }
    });
  }

  // Fallback
  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      details: null
    }
  });
}
