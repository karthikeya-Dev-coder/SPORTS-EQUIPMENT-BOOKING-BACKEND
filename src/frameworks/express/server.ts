import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "../../shared/config";
import { Logger } from "../../shared/logger";
import { initializeDatabase } from "../../infrastructure/database/dataSource";
import { registerRoutes } from "./routes";
import { CronService } from "../../infrastructure/services/CronService";
import { landingPageHTML } from "./views/LandingPage";

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
  // Skip DB initialization for plain health checks and root if needed
  if (req.path === "/api/health" || req.path === "/") {
    return next();
  }

  try {
    await initializeDatabase();
    next();
  } catch (error: any) {
    const dbHost = config.database.url ? 'DATABASE_URL' : config.database.host;
    Logger.error(`Failed to initialize database connection to [${dbHost}]`, error);
    
    res.status(503).json({ 
      error: "Service Unavailable", 
      message: "Database connection failed",
      details: config.nodeEnv === 'development' ? {
        message: error.message,
        code: error.code,
        host: dbHost
      } : undefined
    });
    return;
  }
});

// Root route
app.get("/", (req, res) => {
  res.send(landingPageHTML);
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

