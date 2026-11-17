
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getCurrentTenant } from "../controllers/tenant.controller.js";

const router = Router();

router.get("/", authenticate, getCurrentTenant);

export default router;
