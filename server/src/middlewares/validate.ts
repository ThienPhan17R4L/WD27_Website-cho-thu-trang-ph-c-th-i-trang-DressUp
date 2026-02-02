import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { BadRequestError } from "../utils/errors";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message
      }));
      return next(
        new BadRequestError("VALIDATION_ERROR", "Invalid request body", issues)
      );
    }

    req.body = parsed.data as any;
    next();
  };
}
