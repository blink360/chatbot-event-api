import { Router } from "express";
import { sendMessage } from "../modules/chat/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "src/middlewares/validation.middleware.js";
import { chatSchema } from "src/lib/zod/schema/chatSchema.js";

const router = Router();
router.post(
  "/message",
  authMiddleware,
  validate(chatSchema as any),
  sendMessage as any,
);

export default router;