import cron from "node-cron";
import { AppDataSource } from "@/src/infrastructure/database/dataSource";
import { BookingEntity } from "@/src/adapters/repositories/entities/BookingEntity";
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
            Logger.info(`⏰ Booking ${booking.id} automatically marked as OVERDUE`);
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
