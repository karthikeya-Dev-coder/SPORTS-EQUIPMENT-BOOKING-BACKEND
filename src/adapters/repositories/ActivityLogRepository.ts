import { DataSource, Repository } from "typeorm";
import { ActivityLogEntity } from "./entities/ActivityLogEntity";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";

export class ActivityLogRepository {
  private repository: Repository<ActivityLogEntity>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(ActivityLogEntity);
  }

  async findAll(): Promise<ActivityLogEntity[]> {
    return this.repository.find({ order: { timestamp: "DESC" } });
  }

  async save(log: Partial<ActivityLogEntity>): Promise<ActivityLogEntity> {
    return this.repository.save(log);
  }
}
