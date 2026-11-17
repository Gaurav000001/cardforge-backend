import { z } from "zod";

export const addressSchema = z.object({
  addressLine1: z.string().trim().max(255).optional(),
  locality: z.string().trim().max(150).optional(),
  city: z.string().trim().max(100).optional(),
  stateId: z.number().int().positive().optional(),
  countryId: z.number().int().positive().optional(),
  postalCode: z.string().trim().max(20).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
