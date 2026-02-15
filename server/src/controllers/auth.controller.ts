import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { UnauthorizedError } from "../utils/errors";

function getBearerToken(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);

      const body: any = {
        user: result.user,
        requiresEmailVerification: result.requiresEmailVerification
      };

      if ("accessToken" in result && result.accessToken) {
        body.accessToken = result.accessToken;
      }

      return res.status(201).json(body);
    } catch (e) {
      next(e);
    }
  },

  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = String(req.query.token || "");
      await authService.verifyEmail(token);

      // Redirect to frontend with success message
      const frontendUrl = process.env.APP_ORIGIN || "http://localhost:5173";
      return res.redirect(
        `${frontendUrl}/verify-email?status=success&message=${encodeURIComponent("Email đã được xác minh thành công!")}`
      );
    } catch (e: any) {
      // Redirect to frontend with error message
      const frontendUrl = process.env.APP_ORIGIN || "http://localhost:5173";
      const errorMessage = e.message || "Xác minh email thất bại. Link có thể đã hết hạn.";
      return res.redirect(
        `${frontendUrl}/verify-email?status=error&message=${encodeURIComponent(errorMessage)}`
      );
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, accessToken } = await authService.login(req.body);

      return res.status(200).json({ user, accessToken });
    } catch (e) {
      next(e);
    }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = getBearerToken(req);
      if (!token) throw new UnauthorizedError("NO_ACCESS_TOKEN", "Missing access token");

      const result = await authService.me(token);
      return res.status(200).json({ data: result });
    } catch (e) {
      next(e);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.forgotPassword(req.body.email);
      return res.json({ message: "If the email exists, a reset link has been sent." });
    } catch (e) {
      next(e);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      return res.json({ message: "Password reset successfully" });
    } catch (e) {
      next(e);
    }
  },
};
