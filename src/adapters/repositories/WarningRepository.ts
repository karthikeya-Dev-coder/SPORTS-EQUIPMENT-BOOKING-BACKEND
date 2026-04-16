import { DataSource, Repository } from "typeorm";
import { WarningEntity } from "./entities/WarningEntity";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";

export class WarningRepository {
  async findById(id: string): Promise<WarningEntity | null> {
    return this.repository.findOne({ where: { id } as any });
  }
  private repository: Repository<WarningEntity>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(WarningEntity);
  }

  async findAll(): Promise<WarningEntity[]> {
    return this.repository.find({ relations: ["student"] });
  }

  async findByStudentId(studentId: string): Promise<WarningEntity[]> {
    return this.repository.find({ where: { studentId }, relations: ["student"] });
  }

  async save(warning: Partial<WarningEntity>): Promise<WarningEntity> {
    return this.repository.save(warning);
  }
}
