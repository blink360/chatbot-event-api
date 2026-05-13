import { Response, NextFunction } from "express";
import { processMessage } from "./chat.service.js";
import { AuthenticatedRequest } from "../auth/auth.types.js";


export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { message, conversationId } =
      req.body;

    const result = await processMessage(
      req.user.sub,
      message,
      conversationId,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};