import { DataSource, Repository } from "typeorm";
import { EquipmentEntity } from "./entities/EquipmentEntity";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";

export class EquipmentRepository {
  private repository: Repository<EquipmentEntity>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(EquipmentEntity);
  }

  async findAll(): Promise<EquipmentEntity[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<EquipmentEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<EquipmentEntity | null> {
    return this.repository.findOne({ where: { name } });
  }

  async save(equipment: Partial<EquipmentEntity>): Promise<EquipmentEntity> {
    const saved = await this.repository.save(equipment);
    // Reload to ensure eager relations (like assignedStaff) are populated
    return (await this.findById(saved.id))!;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
