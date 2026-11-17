import type { RequestHandler } from "express";
import { getTenantById } from "../services/tenant.service.js";

export const getCurrentTenant: RequestHandler = async (req, res, next) => {
  try {
    const tenant = await getTenantById(req.auth!.tenantId);

    return res.status(200).json({
      message: "Tenant retrieved successfully",
      data: tenant,
    });
  } catch (error) {
    next(error);
  }
};
