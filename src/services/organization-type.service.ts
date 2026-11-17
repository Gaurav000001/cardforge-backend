import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function validateOrganizationType(organizationTypeId: number) {
  const organizationType = await prisma.organizationType.findUnique({
    where: {
      id: organizationTypeId,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  if (!organizationType) {
    throw new AppError(
      400,
      "INVALID_ORGANIZATION_TYPE",
      "The selected organization type does not exist.",
    );
  }

  return organizationType;
}
