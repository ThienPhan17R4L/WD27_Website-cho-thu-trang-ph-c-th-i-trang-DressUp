import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";
import { setCorrelationId } from "../utils/logger";

const HEADER = "x-correlation-id";

export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = (req.headers[HEADER] as string) || nanoid(12);
  (req as any).correlationId = id;
  setCorrelationId(id);
  res.setHeader(HEADER, id);
  return next();
}
