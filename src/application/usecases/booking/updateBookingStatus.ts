import { BookingRepository } from "@/src/adapters/repositories/BookingRepository";
import { EquipmentRepository } from "@/src/adapters/repositories/EquipmentRepository";
import { ActivityLogRepository } from "@/src/adapters/repositories/ActivityLogRepository";
import { WarningRepository } from "@/src/adapters/repositories/WarningRepository";
import { Logger } from "@/src/shared/logger";

import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import { EmailService } from "@/src/infrastructure/services/EmailService";

export class UpdateBookingStatusUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private equipmentRepository: EquipmentRepository,
    private logRepository: ActivityLogRepository,
    private userRepository: UserRepository,
    private warningRepository: WarningRepository,
    private emailService: EmailService
  ) {}

  async execute(id: string, status: 'approved' | 'rejected' | 'returned' | 'overdue', userId: string, userName: string, userRole: string, penalty?: { amount: number, reason: string }) {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) throw new Error("Booking not found");

    const equipment = await this.equipmentRepository.findById(booking.equipmentId);
    if (!equipment) throw new Error("Equipment not found");

    // Security Check: Staff can only manage their own assigned equipment
    if (userRole === "staff" && equipment.assignedStaffId !== userId) {
      Logger.error(`Security alert: Staff ${userName} (${userId}) attempted to manage unassigned equipment: ${equipment.name}`);
      throw new Error("You are not authorized to manage this equipment. It is not assigned to you.");
    }

    const oldStatus = booking.status;

    // 1. Stock logic
    // 1. Stock logic
    if (status === 'approved' && oldStatus === 'pending') {
      if (equipment.available < booking.quantity) {
        throw new Error("Insufficient stock available to approve");
      }
      equipment.available -= booking.quantity;
      equipment.inUse += booking.quantity;
    } 
    else if (status === 'returned' && (oldStatus === 'approved' || oldStatus === 'overdue' || oldStatus === 'pending')) {
      // Only return stock if it was actually taken (i.e., status was approved or overdue)
      if (oldStatus !== 'pending') {
        equipment.inUse -= booking.quantity;
        equipment.available += booking.quantity;
      }

      // Send email
      const student = await this.userRepository.findById(booking.studentId);
      if (student) {
        await this.emailService.sendBookingReturnEmail(student.email, student.name, equipment.name);
      }

      // 1b. Handle Penalty if provided
      if (status === 'returned' && penalty && penalty.amount > 0) {
        // Get existing monthly warnings to determine level
        const existingWarnings = await this.warningRepository.findByStudentId(booking.studentId);
        const unpaidThisMonth = existingWarnings.filter(w => !w.isPaid).length;
        const nextLevel = Math.min(3, unpaidThisMonth + 1) as 1 | 2 | 3;

        await this.warningRepository.save({
          studentId: booking.studentId,
          reason: penalty.reason || `Late return of ${equipment.name}`,
          amount: penalty.amount,
          level: nextLevel,
          issuedBy: userId,
          issuedAt: new Date(),
          isPaid: false
        });
        Logger.info(`Penalty of ₹${penalty.amount} issued for booking ${id} (Level ${nextLevel})`);
      }
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

    const student = await this.userRepository.findById(booking.studentId);
    const studentName = student?.name || "Student";
    const shortId = (id.split('-')[0] || "ID").toUpperCase();

    await this.logRepository.save({
      userId,
      action: actionMap[status] || "Status Updated",
      details: `${studentName}'s booking for ${equipment.name} set to ${status} by ${userName} (Ref: ${shortId})`,
      timestamp: new Date()
    });

    return { ...booking, status };
  }
}
