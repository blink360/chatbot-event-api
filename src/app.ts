import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { setupSwagger } from "./lib/swagger";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import eventRoutes from "./routes/event.routes";
import { apiLimiter, authLimiter } from "./middlewares/rateLimit.middleware";
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

setupSwagger(app);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(apiLimiter);
app.use("/auth", authLimiter, authRoutes);
app.use("/chat", chatRoutes);
app.use("/event", eventRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;
