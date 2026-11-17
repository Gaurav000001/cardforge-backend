
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { AUTH_CONFIG } from "../config/auth.js";

export interface AccessTokenPayload extends JwtPayload {
  userId: number;
  tenantId: number;
}

function getJwtSecret(): string {
  const secret = process.env.SECRET_KEY;

  if (!secret) {
    throw new Error("SECRET_KEY is not configured");
  }

  return secret;
}
export function createAccessToken(
  userId: number,
  tenantId: number
): string {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: AUTH_CONFIG.accessTokenMaxAge as SignOptions["expiresIn"]
  };

  return jwt.sign(
    { userId, tenantId },
    getJwtSecret(),
    options
  );
}

export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"]
  });

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.userId !== "number" ||
    !Number.isInteger(decoded.userId) ||
    typeof decoded.tenantId !== "number" ||
    !Number.isInteger(decoded.tenantId)
  ) {
    throw new Error("Invalid access token payload");
  }

  return {
    ...decoded,
    userId: decoded.userId,
    tenantId: decoded.tenantId
  };
}
