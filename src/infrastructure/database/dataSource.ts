import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "@/src/shared/config";
import { Logger } from "@/src/shared/logger";
import { UserEntity } from "@/src/adapters/repositories/entities/UserEntity";
import { EquipmentEntity } from "@/src/adapters/repositories/entities/EquipmentEntity";
import { BookingEntity } from "@/src/adapters/repositories/entities/BookingEntity";
import { WarningEntity } from "@/src/adapters/repositories/entities/WarningEntity";
import { ActivityLogEntity } from "@/src/adapters/repositories/entities/ActivityLogEntity";
import { StaffRequestEntity } from "@/src/adapters/repositories/entities/StaffRequestEntity";

export const AppDataSource = new DataSource({
  type: "postgres",
  ...(config.database.url ? { url: config.database.url } : {}),
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  synchronize: config.nodeEnv !== "production",
  logging: config.nodeEnv !== "production",
  entities: [
    UserEntity,
    EquipmentEntity,
    BookingEntity,
    WarningEntity,
    ActivityLogEntity,
    StaffRequestEntity
  ],
  migrations: [],
  subscribers: [],
});

let initializationPromise: Promise<void> | null = null;

export const initializeDatabase = async () => {
  if (AppDataSource.isInitialized) return;

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        await AppDataSource.initialize();
        Logger.info("✅ Database connection established");
      } catch (error) {
        Logger.error("❌ Error during Database initialization:");
        Logger.error(error);
        initializationPromise = null; // Allow retry
        throw error;
      }
    })();
  }

  return initializationPromise;
};
