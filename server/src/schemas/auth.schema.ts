import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .email({ message: "Invalid email" })
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 chars")
    .max(72, "Password too long"),
  fullName: z.string().min(1, "Full name is required").max(80).transform((v) => v.trim()),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ? v.trim() : v))
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1)
});

export type LoginInput = z.infer<typeof loginSchema>;
