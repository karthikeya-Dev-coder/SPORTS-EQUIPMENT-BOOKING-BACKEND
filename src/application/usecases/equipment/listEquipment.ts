import { EquipmentRepository } from "@/src/adapters/repositories/EquipmentRepository";

export class ListEquipmentUseCase {
  constructor(private equipmentRepository: EquipmentRepository) {}

  async execute() {
    return this.equipmentRepository.findAll();
  }
}
