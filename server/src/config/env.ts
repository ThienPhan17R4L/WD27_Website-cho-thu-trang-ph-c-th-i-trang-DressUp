import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

function bool(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v === undefined) return fallback;
  return v === "true" || v === "1";
}

function num(name: string, fallback: number): number {
  const v = process.env[name];
  if (v === undefined) return fallback;
  const n = Number(v);
  if (Number.isNaN(n)) return fallback;
  return n;
}

export const env = {
  PORT: num("PORT", 4000),
  NODE_ENV: optional("NODE_ENV", "development"),
  APP_ORIGIN: optional("APP_ORIGIN", "http://localhost:5173"),
  API_BASE_URL: optional("API_BASE_URL", "http://localhost:3030"),

  MONGODB_URI: required("MONGODB_URI"),

  // ACCESS ONLY
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: optional("JWT_ACCESS_EXPIRES_IN", "600m"),

  REQUIRE_EMAIL_VERIFICATION: bool("REQUIRE_EMAIL_VERIFICATION", true),
  EMAIL_VERIFY_TOKEN_TTL_MINUTES: num("EMAIL_VERIFY_TOKEN_TTL_MINUTES", 60),

  SMTP_HOST: optional("SMTP_HOST", ""),
  SMTP_PORT: num("SMTP_PORT", 587),
  SMTP_USER: optional("SMTP_USER", ""),
  SMTP_PASS: optional("SMTP_PASS", ""),
  SMTP_FROM: optional("SMTP_FROM", "No Reply <no-reply@example.com>")
};
