import { prisma } from "../config/prisma.js";
import type { UploadFileInput } from "../storage/storage.interface.js";
import { storage } from "../storage/index.js";

export async function uploadAttachment(
  tenantId: number,
  input: UploadFileInput,
) {
  // Upload the physical file first.
  const uploadedFile = await storage.upload(input);

  try {
    // Save the uploaded file's metadata in PostgreSQL.
    const attachment = await prisma.attachment.create({
      data: {
        tenantId,
        path: uploadedFile.path,
        url: uploadedFile.url,
        originalFilename: uploadedFile.originalFilename,
        mimeType: uploadedFile.mimeType,
        sizeBytes: BigInt(uploadedFile.sizeBytes),
      },
      select: {
        id: true,
        url: true,
        originalFilename: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    });

    // Convert BigInt to number for JSON serialization.
    return {
      ...attachment,
      sizeBytes: Number(attachment.sizeBytes),
    };
  } catch (error) {
    // If metadata creation fails, remove the uploaded physical file.
    await storage.delete(uploadedFile.path);
    throw error;
  }
}

export async function deleteAttachment(
  tenantId: number,
  attachmentId: number,
): Promise<void> {
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      tenantId,
    },
    select: {
      id: true,
      path: true,
    },
  });

  if (!attachment) {
    return;
  }

  await prisma.attachment.delete({
    where: {
      id: attachment.id,
    },
  });

  await storage.delete(attachment.path);
}
