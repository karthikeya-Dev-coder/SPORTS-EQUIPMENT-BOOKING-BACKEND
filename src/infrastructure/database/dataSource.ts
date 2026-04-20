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
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
  synchronize: true, // Set to false in production
  logging: false,
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

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      Logger.info("✅ Database connection established");
    }
  } catch (error) {
    Logger.error("❌ Error during Database initialization:");
    Logger.error(error);
    // In serverless, we let the error propagate instead of killing the process
    throw error;
  }
};
