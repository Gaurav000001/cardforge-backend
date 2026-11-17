import { prisma } from "../config/prisma.js";
import { hashPassword } from "../utils/password.js";
import { tenantSignupSchema } from "../schema/auth.schema.js";
import { AppError } from "../utils/app-error.js";
import { createHash, randomBytes } from "node:crypto";
import { verifyPassword } from "../utils/password.js";
import { createAccessToken } from "../utils/jwt.js";
import { loginSchema } from "../schema/auth.schema.js";
import { AUTH_CONFIG } from "../config/auth.js";

function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerTenant(input: unknown) {
  // Validate and normalize the incoming signup data.
  const data = tenantSignupSchema.parse(input);

  // Never store the plain-text password.
  const passwordHash = await hashPassword(data.password);

  // Create the tenant and its owner atomically.
  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: data.tenantName,
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });

    let user;

    try {
      user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: passwordHash,
          role: "owner",
        },
        select: {
          id: true,
          tenantId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new AppError(
          409,
          "EMAIL_ALREADY_REGISTERED",
          "An account with this email address already exists.",
        );
      }

      throw error;
    }

    return { tenant, user };
  });
}

export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      tenant: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  // Use the same error for an unknown email and an incorrect password.
  if (!user || !(await verifyPassword(user.password, data.password))) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password.",
    );
  }

  if (user.status !== "active") {
    throw new AppError(403, "ACCOUNT_INACTIVE", "This account is not active.");
  }

  if (user.tenant.status !== "active") {
    throw new AppError(
      403,
      "TENANT_INACTIVE",
      "This organization's account is not active.",
    );
  }

  const accessToken = createAccessToken(user.id, user.tenantId);
  const refreshToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + AUTH_CONFIG.refreshTokenMaxAgeMs);

  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt,
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });

  return {
    accessToken,
    refreshToken,
    session,
    user: {
      id: user.id,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
}

export async function refreshUserSession(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);

  return prisma.$transaction(async (tx) => {
    const session = await tx.userSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            tenant: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const now = new Date();

    if (!session || session.revokedAt !== null || session.expiresAt <= now) {
      throw new AppError(
        401,
        "INVALID_REFRESH_TOKEN",
        "The refresh token is invalid or expired. Please log in again.",
      );
    }

    if (
      session.user.status !== "active" ||
      session.user.tenant.status !== "active"
    ) {
      throw new AppError(
        403,
        "ACCOUNT_INACTIVE",
        "This account or organization is not active.",
      );
    }

    const revoked = await tx.userSession.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        revokedAt: now,
      },
    });

    if (revoked.count !== 1) {
      throw new AppError(
        401,
        "INVALID_REFRESH_TOKEN",
        "The refresh token is invalid or expired. Please log in again.",
      );
    }

    const newRefreshToken = randomBytes(32).toString("base64url");

    const expiresAt = new Date(Date.now() + AUTH_CONFIG.refreshTokenMaxAgeMs);

    await tx.userSession.create({
      data: {
        userId: session.user.id,
        tokenHash: hashRefreshToken(newRefreshToken),
        expiresAt,
      },
    });

    const accessToken = createAccessToken(
      session.user.id,
      session.user.tenantId,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    };
  });
}

export async function logoutUser(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.userSession.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}
