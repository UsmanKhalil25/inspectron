import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email("Invalid email address")),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must not exceed 128 characters"),
});
