import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import type { AddressInput } from "../schema/address.schema.js";

export async function findOrCreateAddress(
  input: AddressInput,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  // Normalize empty strings to null.
  const addressData = {
    addressLine1: input.addressLine1?.trim() || null,
    locality: input.locality?.trim() || null,
    city: input.city?.trim() || null,
    stateId: input.stateId ?? null,
    countryId: input.countryId ?? null,
    postalCode: input.postalCode?.trim() || null,
  };

  // Validate the country if provided.
  if (addressData.countryId !== null) {
    const country = await db.country.findUnique({
      where: { id: addressData.countryId },
      select: { id: true },
    });

    if (!country) {
      throw new AppError(
        400,
        "INVALID_COUNTRY",
        "The selected country does not exist.",
      );
    }
  }

  // Validate the state and its country relationship.
  if (addressData.stateId !== null) {
    const state = await db.state.findUnique({
      where: { id: addressData.stateId },
      select: { id: true, countryId: true },
    });

    if (!state) {
      throw new AppError(
        400,
        "INVALID_STATE",
        "The selected state does not exist.",
      );
    }

    if (
      addressData.countryId !== null &&
      state.countryId !== addressData.countryId
    ) {
      throw new AppError(
        400,
        "STATE_COUNTRY_MISMATCH",
        "The selected state does not belong to the selected country.",
      );
    }
  }

  // Find an address matching all six fields.
  const existingAddress = await db.address.findFirst({
    where: addressData,
  });

  if (existingAddress) {
    return existingAddress;
  }

  // Create a new address if no exact match exists.
  return db.address.create({
    data: addressData,
  });
}
