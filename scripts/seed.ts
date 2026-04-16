import bcrypt from "bcryptjs";
import { AppDataSource } from "../src/infrastructure/database/dataSource";
import { UserEntity } from "../src/adapters/repositories/entities/UserEntity";
import { EquipmentEntity } from "../src/adapters/repositories/entities/EquipmentEntity";
import { BookingEntity } from "../src/adapters/repositories/entities/BookingEntity";
import { WarningEntity } from "../src/adapters/repositories/entities/WarningEntity";
import { ActivityLogEntity } from "../src/adapters/repositories/entities/ActivityLogEntity";
import { StaffRequestEntity } from "../src/adapters/repositories/entities/StaffRequestEntity";
import { Logger } from "../src/shared/logger";

const seed = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    Logger.info("Database initialized for seeding");

    const userRepository = AppDataSource.getRepository(UserEntity);
    const equipmentRepository = AppDataSource.getRepository(EquipmentEntity);
    const bookingRepository = AppDataSource.getRepository(BookingEntity);
    const warningRepository = AppDataSource.getRepository(WarningEntity);
    const logRepository = AppDataSource.getRepository(ActivityLogEntity);
    const staffRequestRepo = AppDataSource.getRepository(StaffRequestEntity);

    // Clear existing data to prevent conflicts on re-seed
    Logger.info("Clearing existing data...");
    await AppDataSource.query('TRUNCATE TABLE users, equipment, bookings, warnings, staff_requests, activity_logs CASCADE;');
    Logger.info("Data cleared successfully.");

    // 1. Seed Users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("sports@123", 10);

    // Using valid UUIDs
    const users = [
      { id: '11111111-1111-1111-1111-111111111111', name: 'System Admin', email: 'admin', role: 'admin', department: 'Sports Administration', password: adminPassword, isActive: true },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Priya Sharma', email: 'priya@gmail.com', role: 'staff', department: 'Cricket', password: userPassword, isActive: true },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Amit Verma', email: 'amit@gmail.com', role: 'staff', department: 'Football', password: userPassword, isActive: true },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Arjun Mehta', email: 'arjun@gmail.com', role: 'student', password: userPassword, isActive: true },
      { id: '55555555-5555-5555-5555-555555555555', name: 'Sneha Reddy', email: 'sneha@gmail.com', role: 'student', password: userPassword, isActive: true },
      { id: '66666666-6666-6666-6666-666666666666', name: 'Rahul Das', email: 'rahul@gmail.com', role: 'student', password: userPassword, isActive: true },
    ];

    for (const u of users) {
      const existing = await userRepository.findOneBy({ email: u.email });
      if (!existing) {
        await userRepository.save(userRepository.create(u as any));
        Logger.info(`User ${u.name} created`);
      }
    }

    // 2. Seed Equipment
    const equipments = [
      { id: 'e1111111-1111-1111-1111-111111111111', name: 'Cricket Bat', category: 'Cricket', totalQuantity: 30, available: 18, inUse: 10, assignedStaffId: '22222222-2222-2222-2222-222222222222' },
      { id: 'e2222222-2222-2222-2222-222222222222', name: 'Football', category: 'Football', totalQuantity: 40, available: 25, inUse: 12, assignedStaffId: '33333333-3333-3333-3333-333333333333' },
      { id: 'e3333333-3333-3333-3333-333333333333', name: 'Volleyball', category: 'Volleyball', totalQuantity: 20, available: 12, inUse: 6, assignedStaffId: '22222222-2222-2222-2222-222222222222' },
      { id: 'e4444444-4444-4444-4444-444444444444', name: 'Badminton Racket', category: 'Badminton', totalQuantity: 25, available: 20, inUse: 4, assignedStaffId: '33333333-3333-3333-3333-333333333333' },
    ];

    for (const eq of equipments) {
      const existing = await equipmentRepository.findOneBy({ name: eq.name });
      if (!existing) {
        await equipmentRepository.save(equipmentRepository.create(eq as any));
        Logger.info(`Equipment ${eq.name} created`);
      }
    }

    // 3. Seed Bookings
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const bookings = [
      { studentId: '44444444-4444-4444-4444-444444444444', equipmentId: 'e1111111-1111-1111-1111-111111111111', date: today, timeSlot: '09:00 - 10:00', quantity: 1, status: 'approved' },
      { studentId: '55555555-5555-5555-5555-555555555555', equipmentId: 'e2222222-2222-2222-2222-222222222222', date: today, timeSlot: '10:00 - 11:00', quantity: 1, status: 'pending' },
      { studentId: '66666666-6666-6666-6666-666666666666', equipmentId: 'e4444444-4444-4444-4444-444444444444', date: yesterday, timeSlot: '14:00 - 15:00', quantity: 2, status: 'returned' },
      { studentId: '44444444-4444-4444-4444-444444444444', equipmentId: 'e3333333-3333-3333-3333-333333333333', date: yesterday, timeSlot: '11:00 - 12:00', quantity: 1, status: 'overdue' },
    ];

    for (const b of bookings) {
      const existing = await bookingRepository.findOneBy({
        studentId: b.studentId,
        equipmentId: b.equipmentId,
        date: b.date as string
      });
      if (!existing) {
        await bookingRepository.save(bookingRepository.create(b as any));
      }
    }

    // 4. Seed Warnings/Penalties
    const warnings = [
      { studentId: '44444444-4444-4444-4444-444444444444', reason: 'Late return of Volleyball', level: 1, issuedBy: '22222222-2222-2222-2222-222222222222', amount: 50.00, isPaid: false },
      { studentId: '66666666-6666-6666-6666-666666666666', reason: 'Damaged Badminton Racket handle', level: 2, issuedBy: '33333333-3333-3333-3333-333333333333', amount: 200.00, isPaid: true, paidAt: new Date() },
    ];

    for (const w of warnings) {
      const existing = await warningRepository.findOneBy({ studentId: w.studentId, reason: w.reason });
      if (!existing) {
        await warningRepository.save(warningRepository.create(w as any));
      }
    }

    // 5. Seed Staff Requests
    const staffRequests = [
      { staffId: '22222222-2222-2222-2222-222222222222', equipmentName: 'Cricket Balls (New)', quantity: 12, status: 'pending' },
      { staffId: '33333333-3333-3333-3333-333333333333', equipmentName: 'Training Cones Set', quantity: 10, status: 'fulfilled' },
      { staffId: '22222222-2222-2222-2222-222222222222', equipmentName: 'Replacement Ground Nets', quantity: 2, status: 'fulfilled' }
    ];

    for (const sr of staffRequests) {
      const existing = await staffRequestRepo.findOneBy({ equipmentName: sr.equipmentName });
      if (!existing) {
        await staffRequestRepo.save(staffRequestRepo.create(sr as any));
      }
    }

    // 6. Seed Activity Logs
    const logs = [
      { userId: '11111111-1111-1111-1111-111111111111', action: 'System Setup', details: 'Full database seeding performed', timestamp: new Date() },
      { userId: '22222222-2222-2222-2222-222222222222', action: 'Login', details: 'Staff logged in via Web Portal', timestamp: new Date() },
    ];

    for (const l of logs) {
      await logRepository.save(logRepository.create(l as any));
    }

    Logger.info("✅ Seeding completed successfully");
    console.log("\n" + "=".repeat(40));
    console.log("🚀 ADMIN INITIAL CREDENTIALS");
    console.log("=".repeat(40));
    console.log(`👤 User ID : admin`);
    console.log(`🔑 Password: admin123`);
    console.log("=".repeat(40) + "\n");
    process.exit(0);
  } catch (error) {
    Logger.error("❌ Seeding failed:");
    Logger.error(error);
    process.exit(1);
  }
};

seed();
