import { Router } from "express";
import { sendMessage } from "../modules/chat/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { chatSchema } from "../lib/zod/schema/chatSchema";

const router = Router();
router.post(
  "/message",
  authMiddleware,
  validate(chatSchema as any),
  sendMessage as any,
);

export default router;