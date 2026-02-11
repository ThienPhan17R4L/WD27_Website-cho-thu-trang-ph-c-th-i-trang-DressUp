import { Request, Response, NextFunction } from "express";

/**
 * Middleware to require admin role
 * Must be used AFTER requireAuth middleware
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: "UNAUTHORIZED" });
  }

  const roles = user.roles || [];
  if (!roles.includes("admin")) {
    return res.status(403).json({ message: "FORBIDDEN - Admin access required" });
  }

  return next();
}
