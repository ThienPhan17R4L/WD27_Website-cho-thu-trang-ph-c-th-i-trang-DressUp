import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 60_000, // 1 min
  limit: 20, // 20 req/min per IP for auth endpoints
  standardHeaders: "draft-7",
  legacyHeaders: false
});
