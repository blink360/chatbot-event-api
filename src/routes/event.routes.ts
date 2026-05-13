import { Router } from "express";
import { listEvents } from "../modules/event/event.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, listEvents as any);

export default router;