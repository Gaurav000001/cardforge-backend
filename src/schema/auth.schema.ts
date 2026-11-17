
import { z } from "zod";

export const tenantSignupSchema = z.object({
  tenantName: z.string().trim().min(2).max(150),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().trim().email().max(255).transform((value) =>
    value.toLowerCase()
  ),
  password: z.string().min(12).max(128)
});

export type TenantSignupInput = z.infer<
  typeof tenantSignupSchema
>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;