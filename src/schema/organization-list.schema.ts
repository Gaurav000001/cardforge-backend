import { z } from "zod";

export const organizationListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  organizationTypeId: z.coerce.number().int().positive().optional(),

  status: z.enum(["active", "inactive"]).optional(),

  sortBy: z
    .enum(["name", "code", "createdAt", "updatedAt"])
    .default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type OrganizationListInput = z.infer<
  typeof organizationListSchema
>;