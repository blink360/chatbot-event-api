import { Router } from "express";
import { validate } from "../middlewares/validation.middleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../lib/zod/schema/authSchema";

import {
  register,
  login,
  refreshToken,
  logout,
} from "../modules/auth/auth.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema as any), register);
router.post("/login", validate(loginSchema as any), login);
router.post("/refresh", validate(refreshSchema as any), refreshToken);
router.post("/logout", authMiddleware, logout as any);

export default router;