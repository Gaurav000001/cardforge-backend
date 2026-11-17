import { z } from "zod";
import { addressSchema } from "./address.schema.js";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  organizationTypeId: z.number().int().positive(),
  address: addressSchema.optional(),
  email: z.string().trim().email().max(255).optional(),
  phone: z.string().trim().max(30).optional(),
  code: z.string().trim().max(60).optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
