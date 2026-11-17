import type { Request, Response, NextFunction } from "express";
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerTenant,
} from "../services/auth.service.js";
import { AUTH_CONFIG } from "../config/auth.js";
import { AppError } from "../utils/app-error.js";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerTenant(req.body);

    return res.status(201).json({
      message: "Tenant registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser(req.body);

    const { refreshToken, ...responseData } = result;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: AUTH_CONFIG.refreshTokenMaxAgeMs,
    });

    return res.status(200).json({
      message: "Login successful",
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken: unknown = req.cookies?.refreshToken;

    if (typeof refreshToken !== "string" || !refreshToken) {
      throw new AppError(
        401,
        "REFRESH_TOKEN_MISSING",
        "A refresh token is required. Please log in again.",
      );
    }

    const result = await refreshUserSession(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: AUTH_CONFIG.refreshTokenMaxAgeMs,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken: unknown = req.cookies?.refreshToken;

    if (typeof refreshToken === "string" && refreshToken.length > 0) {
      await logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}
