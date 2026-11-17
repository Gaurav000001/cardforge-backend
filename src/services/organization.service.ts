import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import type { CreateOrganizationInput } from "../schema/organization.schema.js";
import { findOrCreateAddress } from "./address.service.js";
import { deleteAttachment, uploadAttachment } from "./attachment.service.js";
import { processOrganizationLogo } from "../utils/image-processor.js";

export async function createOrganization(
  tenantId: number,
  input: CreateOrganizationInput,
  logo?: Express.Multer.File,
) {
  const organizationType = await prisma.organizationType.findUnique({
    where: { id: input.organizationTypeId },
    select: { id: true },
  });

  if (!organizationType) {
    throw new AppError(
      400,
      "INVALID_ORGANIZATION_TYPE",
      "The selected organization type does not exist.",
    );
  }

  let attachmentId: number | undefined;

  if (logo) {
    const processedBuffer = await processOrganizationLogo(logo.buffer);

    const attachment = await uploadAttachment(tenantId, {
      buffer: processedBuffer,
      originalFilename: logo.originalname,
      mimeType: "image/webp",
      fileExtension: ".webp",
    });

    attachmentId = attachment.id;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const address = input.address
        ? await findOrCreateAddress(input.address, tx)
        : null;

      return tx.organization.create({
        data: {
          name: input.name,
          organizationTypeId: input.organizationTypeId,
          attachmentId,
          addressId: address?.id,
          email: input.email,
          phone: input.phone,
          code: input.code,
          tenantId,
        },
        select: {
          id: true,
          name: true,
          organizationTypeId: true,
          attachmentId: true,
          addressId: true,
          email: true,
          phone: true,
          code: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  } catch (error) {
    if (attachmentId !== undefined) {
      await deleteAttachment(tenantId, attachmentId);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        409,
        "ORGANIZATION_CODE_EXISTS",
        "An organization with this code already exists.",
      );
    }

    throw error;
  }
}
