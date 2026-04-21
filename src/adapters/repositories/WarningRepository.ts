import { DataSource, Repository } from "typeorm";
import { WarningEntity } from "./entities/WarningEntity";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";

export class WarningRepository {
  async findById(id: string): Promise<WarningEntity | null> {
    return this.repository.findOne({ where: { id } as any, relations: ["student", "issuer"] });
  }
  private repository: Repository<WarningEntity>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(WarningEntity);
  }

  async findAll(issuedBy?: string): Promise<WarningEntity[]> {
    const where: any = {};
    if (issuedBy) where.issuedBy = issuedBy;
    return this.repository.find({ 
      where,
      relations: ["student", "issuer"] 
    });
  }

  async findByStudentId(studentId: string): Promise<WarningEntity[]> {
    return this.repository.find({ where: { studentId }, relations: ["student", "issuer"] });
  }

  async save(warning: Partial<WarningEntity>): Promise<WarningEntity> {
    return this.repository.save(warning);
  }

  async deleteAllByStudentId(studentId: string): Promise<void> {
    await this.repository.delete({ studentId });
  }
}
