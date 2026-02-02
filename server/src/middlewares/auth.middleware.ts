import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { env } from "../config/env";

type JwtPayload = { sub: string; roles?: string[] };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "MISSING_TOKEN" });
  }

  const token = auth.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    (req as any).user = { id: decoded.sub, roles: decoded.roles ?? [] };
    return next();
  } catch {
    return res.status(401).json({ message: "INVALID_OR_EXPIRED_TOKEN" });
  }
}
