import { Response, NextFunction } from "express";
import { getEvents } from "./event.service";
import { AuthenticatedRequest } from "../auth/auth.types";

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