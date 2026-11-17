import type { RequestHandler } from "express";
import { createOrganizationSchema } from "../schema/organization.schema.js";
import { createOrganization } from "../services/organization.service.js";
import { AppError } from "../utils/app-error.js";

export const createOrganizationController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const requestBody = { ...req.body };

    // Convert organizationTypeId from string to number.
    if (requestBody.organizationTypeId !== undefined) {
      requestBody.organizationTypeId = Number(requestBody.organizationTypeId);
    }

    // Parse address from JSON string to object.
    if (typeof requestBody.address === "string") {
      try {
        requestBody.address = JSON.parse(requestBody.address);
      } catch {
        throw new AppError(
          400,
          "INVALID_ADDRESS",
          "The address must contain valid JSON.",
        );
      }
    }

    const validation = createOrganizationSchema.safeParse(requestBody);

    if (!validation.success) {
      return next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "The provided organization details are invalid.",
        ),
      );
    }

    const organization = await createOrganization(
      req.auth!.tenantId,
      validation.data,
      req.file,
    );

    return res.status(201).json({
      message: "Organization created successfully.",
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};
