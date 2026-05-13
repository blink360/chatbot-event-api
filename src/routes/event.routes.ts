import { Router } from "express";
import { listEvents } from "../modules/event/event.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, listEvents as any);

export default router;