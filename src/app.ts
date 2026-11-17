import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";

import { prisma } from "./config/prisma.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import organizationRoutes from "./routes/organization.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "cardforge-backend",
  });
});

app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/organizations", organizationRoutes);

// Error middleware must remain after the routes.
app.use(errorMiddleware);

export default app;
