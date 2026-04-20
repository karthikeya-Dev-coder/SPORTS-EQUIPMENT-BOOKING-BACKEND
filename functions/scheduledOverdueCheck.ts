import { onSchedule } from "firebase-functions/v2/scheduler";
import { AppDataSource } from "../src/infrastructure/database/dataSource";
import { BookingEntity } from "../src/adapters/repositories/entities/BookingEntity";
import { Logger } from "../src/shared/logger";

export const scheduledOverdueCheck = onSchedule("every 1 minutes", async (event) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

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
        Logger.info(`⏰ [Scheduled] Booking ${booking.id} automatically marked as OVERDUE`);
      }
    }
  } catch (error) {
    Logger.error("❌ Scheduled Job Error:", error);
    throw error;
  }
});
