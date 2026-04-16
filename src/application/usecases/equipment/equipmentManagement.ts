import { EquipmentRepository } from "@/src/adapters/repositories/EquipmentRepository";
import { EquipmentEntity } from "@/src/adapters/repositories/entities/EquipmentEntity";

export class AddEquipmentUseCase {
  constructor(private equipmentRepository: EquipmentRepository) {}

  async execute(data: Partial<EquipmentEntity>) {
    // Initial stock setup
    const total = data.totalQuantity || 0;
    return this.equipmentRepository.save({
      ...data,
      available: total,
      inUse: 0
    });
  }
}

export class UpdateEquipmentUseCase {
  constructor(private equipmentRepository: EquipmentRepository) {}

  async execute(id: string, data: Partial<EquipmentEntity>) {
    const existing = await this.equipmentRepository.findById(id);
    if (!existing) throw new Error("Equipment not found");
    
    // Total change logic might be complex if they decrease total below inUse
    // For now, simple merge
    return this.equipmentRepository.save({ ...existing, ...data });
  }
}

export class DeleteEquipmentUseCase {
  constructor(private equipmentRepository: EquipmentRepository) {}

  async execute(id: string) {
    return this.equipmentRepository.delete(id);
  }
}
