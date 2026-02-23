import { Request, Response, NextFunction } from "express";

/**
 * Middleware to require staff or admin role
 * Must be used AFTER requireAuth middleware
 */
export function requireStaffOrAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: "UNAUTHORIZED" });
  }

  const roles: string[] = user.roles || [];
  if (!roles.includes("staff") && !roles.includes("admin")) {
    return res.status(403).json({ message: "FORBIDDEN - Staff or Admin access required" });
  }

  return next();
}
