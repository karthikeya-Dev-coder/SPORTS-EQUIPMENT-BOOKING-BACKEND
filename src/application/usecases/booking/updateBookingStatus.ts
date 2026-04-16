import { BookingRepository } from "@/src/adapters/repositories/BookingRepository";
import { EquipmentRepository } from "@/src/adapters/repositories/EquipmentRepository";
import { ActivityLogRepository } from "@/src/adapters/repositories/ActivityLogRepository";
import { Logger } from "@/src/shared/logger";

export class UpdateBookingStatusUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private equipmentRepository: EquipmentRepository,
    private logRepository: ActivityLogRepository
  ) {}

  async execute(id: string, status: 'approved' | 'rejected' | 'returned' | 'overdue', userId: string, userName: string) {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) throw new Error("Booking not found");

    const equipment = await this.equipmentRepository.findById(booking.equipmentId);
    if (!equipment) throw new Error("Equipment not found");

    const oldStatus = booking.status;

    // 1. Stock logic
    if (status === 'approved' && oldStatus === 'pending') {
      if (equipment.available < booking.quantity) {
        throw new Error("Insufficient stock available to approve");
      }
      equipment.available -= booking.quantity;
      equipment.inUse += booking.quantity;
    } 
    else if (status === 'returned' && (oldStatus === 'approved' || oldStatus === 'overdue')) {
      equipment.inUse -= booking.quantity;
      equipment.available += booking.quantity;
    }

    // 2. Save status
    await this.bookingRepository.updateStatus(id, status);
    await this.equipmentRepository.save(equipment);

    // 3. Log Activity
    const actionMap: Record<string, string> = {
      approved: "Booking Approved",
      returned: "Booking Returned",
      rejected: "Booking Rejected",
      overdue: "Return Delayed"
    };

    await this.logRepository.save({
      userId,
      action: actionMap[status] || "Status Updated",
      details: `Booking ${id} (${booking.equipmentName}) set to ${status} by ${userName}`,
      timestamp: new Date()
    });

    return { ...booking, status };
  }
}
