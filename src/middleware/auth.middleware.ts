import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/app-error.js";

export interface AuthContext {
  userId: number;
  tenantId: number;
}

export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export type AuthenticatedRequestHandler = (
  req: Request & { auth: AuthContext },
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "ACCESS_TOKEN_MISSING",
        message: "An access token is required.",
      },
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      error: {
        code: "ACCESS_TOKEN_MISSING",
        message: "An access token is required.",
      },
    });
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    return res.status(401).json({
      error: {
        code: "INVALID_ACCESS_TOKEN",
        message: "The access token is invalid or expired.",
      },
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        tenantId: true,
        status: true,
        tenant: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!user || user.tenantId !== payload.tenantId) {
      return res.status(401).json({
        error: {
          code: "INVALID_ACCESS_TOKEN",
          message: "The access token is invalid.",
        },
      });
    }

    if (user.status !== "active" || user.tenant.status !== "active") {
      return res.status(403).json({
        error: {
          code: "ACCOUNT_INACTIVE",
          message: "This account or organization is not active.",
        },
      });
    }

    req.auth = {
      userId: user.id,
      tenantId: user.tenantId,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
