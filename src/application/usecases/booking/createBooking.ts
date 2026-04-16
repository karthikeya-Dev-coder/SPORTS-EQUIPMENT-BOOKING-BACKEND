import { BookingRepository } from "@/src/adapters/repositories/BookingRepository";
import { EquipmentRepository } from "@/src/adapters/repositories/EquipmentRepository";
import { WarningRepository } from "@/src/adapters/repositories/WarningRepository";
import { ActivityLogRepository } from "@/src/adapters/repositories/ActivityLogRepository";

export class CreateBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private equipmentRepository: EquipmentRepository,
    private warningRepository: WarningRepository,
    private logRepository: ActivityLogRepository
  ) {}

  async execute(data: {
    studentId: string;
    equipmentId: string;
    date: string;
    timeSlot: string;
    quantity: number;
  }) {
    // 1. Suspension Check
    const warnings = await this.warningRepository.findByStudentId(data.studentId);
    const isSuspended = warnings.length >= 3 || warnings.some(w => w.level === 3);
    if (isSuspended) throw new Error("Student is suspended due to penalties");

    const equipment = await this.equipmentRepository.findById(data.equipmentId);
    if (!equipment) throw new Error("Equipment not found");
    if (equipment.available < data.quantity) throw new Error("Insufficient stock available");

    const booking = await this.bookingRepository.save({
      ...data,
      status: 'pending'
    });

    // Log Activity
    await this.logRepository.save({
      userId: data.studentId,
      action: "Booking Created",
      details: `Booked ${data.quantity}x ${equipment.name}`,
      timestamp: new Date()
    });

    return booking;
  }
}
