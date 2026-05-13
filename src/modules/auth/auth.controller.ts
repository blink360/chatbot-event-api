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
    res.status(200).json(result);
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
    const result = await refreshTokenService(req.body.refreshToken);
    res.status(200).json(result);
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
