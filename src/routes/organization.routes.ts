import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadOrganizationLogo } from "../middleware/upload.middleware.js";
import { createOrganizationController } from "../controllers/organization.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", uploadOrganizationLogo, createOrganizationController);

export default router;
