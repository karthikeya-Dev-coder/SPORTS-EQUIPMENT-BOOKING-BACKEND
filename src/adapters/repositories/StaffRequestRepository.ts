import { DataSource, Repository } from "typeorm";
import { StaffRequestEntity } from "./entities/StaffRequestEntity";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";

export class StaffRequestRepository {
  private repository: Repository<StaffRequestEntity>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(StaffRequestEntity);
  }

  async findAll(): Promise<StaffRequestEntity[]> {
    return this.repository.find({ relations: ["staff"], order: { createdAt: "DESC" } });
  }

  async findByStaffId(staffId: string): Promise<StaffRequestEntity[]> {
    return this.repository.find({ where: { staffId }, order: { createdAt: "DESC" } });
  }

  async save(request: Partial<StaffRequestEntity>): Promise<StaffRequestEntity> {
    return this.repository.save(request);
  }

  async findById(id: string): Promise<StaffRequestEntity | null> {
    return this.repository.findOne({ where: { id } });
  }
}
