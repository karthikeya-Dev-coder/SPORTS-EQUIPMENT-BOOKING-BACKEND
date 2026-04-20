import { BookingRepository } from "@/src/adapters/repositories/BookingRepository";
import { EquipmentRepository } from "@/src/adapters/repositories/EquipmentRepository";
import { WarningRepository } from "@/src/adapters/repositories/WarningRepository";
import { ActivityLogRepository } from "@/src/adapters/repositories/ActivityLogRepository";
import { UserRepository } from "@/src/adapters/repositories/UserRepository";

export class CreateBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private equipmentRepository: EquipmentRepository,
    private warningRepository: WarningRepository,
    private logRepository: ActivityLogRepository,
    private userRepository: UserRepository
  ) {}

  async execute(data: {
    studentId: string;
    equipmentId?: string;
    equipmentName?: string;
    date: string;
    timeSlot: string;
    quantity: number;
  }) {
    // 1. Fetch User Info for Logging
    const student = await this.userRepository.findById(data.studentId);
    const studentName = student?.name || "Student";

    // 1. Suspension Check (Total Count & Payment Status)
    const allWarnings = await this.warningRepository.findByStudentId(data.studentId);
    
    const totalWarnings = allWarnings.length;
    const hasLevel3 = allWarnings.some(w => w.level === 3);
    const hasUnpaidFines = allWarnings.some(w => !w.isPaid);

    if (totalWarnings >= 3 || hasLevel3) {
      // Find the latest critical warning date
      const latestWarningDate = allWarnings.reduce((latest, current) => 
        current.issuedAt > latest ? current.issuedAt : latest, new Date(0));
      
      const suspensionDurationDays = 21; // 3 weeks
      const now = new Date();
      if (latestWarningDate.getTime() === 0) throw new Error("Warning data inconsistency detected");

      const suspensionEndDate = new Date(latestWarningDate);
      suspensionEndDate.setDate(suspensionEndDate.getDate() + suspensionDurationDays);

      if (now < suspensionEndDate) {
        const remainingDays = Math.ceil((suspensionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        throw new Error(`Student is suspended for 3 weeks due to recurrent warnings. Suspension ends in ${remainingDays} days.`);
      }
    }

    if (hasUnpaidFines) {
      throw new Error("Booking blocked: You have unpaid penalties. Please clear your fines to continue booking.");
    }

    let equipmentId = data.equipmentId;

    // 2. Find Equipment by Name if ID is missing
    if (!equipmentId && data.equipmentName) {
      const eq = await this.equipmentRepository.findByName(data.equipmentName);
      if (!eq) throw new Error(`Equipment with name "${data.equipmentName}" not found`);
      equipmentId = eq.id;
    }

    if (!equipmentId) throw new Error("Equipment ID or name must be provided");

    const equipment = await this.equipmentRepository.findById(equipmentId);
    if (!equipment) throw new Error("Equipment not found");
    if (equipment.available < data.quantity) throw new Error("Insufficient stock available");

    const booking = await this.bookingRepository.save({
      studentId: data.studentId,
      equipmentId: equipmentId,
      date: data.date,
      timeSlot: data.timeSlot,
      quantity: data.quantity,
      status: 'approved' // Auto-approved
    });

    // 3. Update Equipment Stock immediately
    equipment.available -= data.quantity;
    equipment.inUse += data.quantity;
    await this.equipmentRepository.save(equipment);

    // 4. Log Activity
    await this.logRepository.save({
      userId: data.studentId,
      action: "Booking Created & Approved",
      details: `Auto-approved booking of ${data.quantity}x ${equipment.name}`,
      timestamp: new Date()
    });

    return booking;
  }
}
