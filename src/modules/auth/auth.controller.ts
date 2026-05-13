import { Request, Response, NextFunction } from "express";
import {
  register as registerService,
  login as loginService,
  refreshToken as refreshTokenService,
  logout as logoutService,
} from "./auth.service";

import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  AuthenticatedRequest,
} from "./auth.types.js";
import "dotenv/config";

export const register = async (
  req: Request<{}, {}, RegisterDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await registerService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await loginService(req.body);
    res
      .cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(result);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request<{}, {}, RefreshTokenDto>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await refreshTokenService(req.cookies.refreshToken);
    res
      .cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await logoutService(req.user.sub);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
