import { Router } from "express";
import { validate } from "../middlewares/validation.middleware";
import {
  registerSchema,
  loginSchema,
} from "../lib/zod/schema/authSchema";

import {
  register,
  login,
  refreshToken,
  logout,
  deleteAccount,
} from "../modules/auth/auth.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema as any), register);
router.post("/login", validate(loginSchema as any), login);
router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logout as any);
router.delete("/delete", authMiddleware, deleteAccount as any);

export default router;
