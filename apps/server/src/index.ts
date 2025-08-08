import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import plantsRouter from "./routes/plants";
import eventsRouter from "./routes/events";
import calendarRouter from "./routes/calendar";
import weatherRouter from "./routes/weather";
import roomsRouter from "./routes/rooms";
import usersRouter from "./routes/users";
import authRouter from "./routes/auth";
import trefleRouter from "./routes/trefle";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/plants", plantsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/trefle", trefleRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

// Start server
app.listen(port, () => {
  console.log(`🌱 PlantCare server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
