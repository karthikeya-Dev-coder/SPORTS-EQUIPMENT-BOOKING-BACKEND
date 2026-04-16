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

const startServer = async () => {
  try {
    // 1. Initialize Database
    await initializeDatabase();

    // 2. Start Services
    CronService.start();

    // 3. Setup Express
    const app = express();

    app.use(helmet());
    app.use(cors({
      origin: "*", // Adjust as needed
      credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());

    // 3. Register Routes
    const apiRouter = registerRoutes();
    app.use("/api", apiRouter);

    // 4. Start Listen
    app.listen(config.port, () => {
      Logger.info(`🚀 Server running on http://localhost:${config.port}`);
      Logger.info(`🏥 Health check at http://localhost:${config.port}/api/health`);
    });

  } catch (error) {
    Logger.error("❌ Failed to start server:");
    Logger.error(error);
    process.exit(1);
  }
};

startServer();
