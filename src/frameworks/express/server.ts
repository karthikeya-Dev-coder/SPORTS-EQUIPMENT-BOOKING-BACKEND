import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "@/src/shared/config";
import { Logger } from "@/src/shared/logger";
import { initializeDatabase } from "@/src/infrastructure/database/dataSource";
import { registerRoutes } from "./routes";
import { CronService } from "@/src/infrastructure/services/CronService";

const app = express();

app.use(helmet());
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database initialization middleware for serverless environments
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    Logger.error("Failed to initialize database in middleware:", error);
    res.status(500).json({ error: "Internal Server Error (DB)" });
    return;
  }
});

// Register Routes
const apiRouter = registerRoutes();
app.use("/api", apiRouter);

// Local development server
if (require.main === module) {
  const startLocalServer = async () => {
    try {
      await initializeDatabase();
      CronService.start();
      app.listen(config.port, () => {
        Logger.info(`🚀 Local server running on http://localhost:${config.port}`);
      });
    } catch (error) {
      Logger.error("Failed to start local server:", error);
      process.exit(1);
    }
  };
  startLocalServer();
}

export default app;

