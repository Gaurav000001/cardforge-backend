import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function getTenantById(tenantId: number) {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId,
    },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!tenant) {
    throw new AppError(
      404,
      "TENANT_NOT_FOUND",
      "The organization account could not be found.",
    );
  }

  return tenant;
}
