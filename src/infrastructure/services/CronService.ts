import cron from "node-cron";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";
import { BookingEntity } from "@/src/adapters/repositories/entities/BookingEntity";
import { WarningEntity } from "@/src/adapters/repositories/entities/WarningEntity";
import { Logger } from "@/src/shared/logger";
import { LessThan } from "typeorm";

export class CronService {
  static start() {
    // Run every minute
    cron.schedule("* * * * *", async () => {
      try {
        const bookingRepo = AppDataSource.getRepository(BookingEntity);
        const now = new Date();
        const dateParts = now.toISOString().split('T');
        const dateStr = dateParts[0] as string;

        // Find approved bookings that are potentially overdue
        const approvedBookings = await bookingRepo.find({
          where: { status: "approved", date: dateStr }
        });

        for (const booking of approvedBookings) {
          const slot = booking.timeSlot.split('-')[1]?.trim();
          if (!slot) continue;

          const endTime = new Date(`${booking.date}T${slot}:00`);
          if (endTime < now) {
            booking.status = "overdue";
            await bookingRepo.save(booking);
            
            // Auto-issue Level 1 penalty
            const warningRepo = AppDataSource.getRepository(WarningEntity);
            
            // Check if we already issued an overdue warning for this booking to avoid duplicates
            // We can check by reason string containing booking id or just search for this student's recent warnings
            const existingWarning = await warningRepo.findOne({
              where: { 
                studentId: booking.studentId, 
                reason: `Auto-Strike: Session time limit exceeded for ${booking.equipment?.name || 'Equipment'} (Ref: ${booking.id.split('-')[0]})` 
              }
            });

            if (!existingWarning) {
              await warningRepo.save({
                studentId: booking.studentId,
                reason: `Auto-Strike: Session time limit exceeded for ${booking.equipment?.name || 'Equipment'} (Ref: ${booking.id.split('-')[0]})`,
                level: 1, // Start with Level 1 for auto-strikes
                issuedAt: new Date(),
                isPaid: false,
                amount: 50 // Fixed initial overdue fine
              });
              Logger.info(`⏰ Booking ${booking.id} automatically marked as OVERDUE and Level 1 penalty issued`);
            } else {
              Logger.info(`⏰ Booking ${booking.id} marked as OVERDUE (Penalty already exists)`);
            }
          }
        }
      } catch (error) {
        Logger.error("❌ Cron Job Error:");
        Logger.error(error);
      }
    });

    Logger.info("🕒 Real-time Monitoring Cron Job started");
  }
}
