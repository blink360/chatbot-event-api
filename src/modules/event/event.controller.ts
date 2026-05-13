import { Response, NextFunction } from "express";
import { getEvents } from "./event.service.js";
import { AuthenticatedRequest } from "../auth/auth.types.js";

export const listEvents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const events = await getEvents(req.user.sub);
    res.json(events);
  } catch (err) {
    next(err);
  }
};