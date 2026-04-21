import { Router } from "express";
import { authenticate, authorize } from "../../infrastructure/middleware/standalone_auth";
import { AuthController } from "../../adapters/controllers/authController";
import { EquipmentController } from "../../adapters/controllers/equipmentController";
import { BookingController } from "../../adapters/controllers/bookingController";
import { UserController } from "../../adapters/controllers/userController";
import { DashboardController } from "../../adapters/controllers/dashboardController";
import { StaffRequestController } from "../../adapters/controllers/staffRequestController";
import { PenaltyController } from "../../adapters/controllers/penaltyController";

import { UserRepository } from "../../adapters/repositories/UserRepository";
import { EquipmentRepository } from "../../adapters/repositories/EquipmentRepository";
import { BookingRepository } from "../../adapters/repositories/BookingRepository";
import { ActivityLogRepository } from "../../adapters/repositories/ActivityLogRepository";
import { WarningRepository } from "../../adapters/repositories/WarningRepository";
import { StaffRequestRepository } from "../../adapters/repositories/StaffRequestRepository";

import { LoginUseCase } from "../../application/usecases/auth/login";
import { ForgotPasswordUseCase } from "../../application/usecases/auth/forgotPassword";
import { ResetPasswordUseCase } from "../../application/usecases/auth/resetPassword";
import { SendAdminCredentialsUseCase } from "../../application/usecases/auth/sendAdminCredentials";
import { ListEquipmentUseCase } from "../../application/usecases/equipment/listEquipment";
import { AddEquipmentUseCase, UpdateEquipmentUseCase, DeleteEquipmentUseCase } from "../../application/usecases/equipment/equipmentManagement";
import { CreateBookingUseCase } from "../../application/usecases/booking/createBooking";
import { UpdateBookingStatusUseCase } from "../../application/usecases/booking/updateBookingStatus";
import { BulkImportStudentsUseCase } from "../../application/usecases/user/bulkImportStudents";
import { CreateUserUseCase } from "../../application/usecases/user/createUser";
import { IssueWarningUseCase, PayPenaltyUseCase } from "../../application/usecases/penalty/penaltyManagement";
import { ClearWarningsUseCase } from "../../application/usecases/penalty/clearWarnings";
import { EmailService } from "../../infrastructure/services/EmailService";

export const registerRoutes = () => {
  const router = Router();

  // Infrastructure
  const emailService = new EmailService();

  // Repositories
  const userRepository = new UserRepository();
  const equipmentRepository = new EquipmentRepository();
  const bookingRepository = new BookingRepository();
  const logRepository = new ActivityLogRepository();
  const warningRepository = new WarningRepository();
  const staffRequestRepository = new StaffRequestRepository();

  // Use cases
  const loginUseCase = new LoginUseCase(userRepository);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, emailService);
  const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);
  const sendAdminCredentialsUseCase = new SendAdminCredentialsUseCase(emailService);
  const listEquipmentUseCase = new ListEquipmentUseCase(equipmentRepository);
  const addEquipmentUseCase = new AddEquipmentUseCase(equipmentRepository);
  const updateEquipmentUseCase = new UpdateEquipmentUseCase(equipmentRepository);
  const deleteEquipmentUseCase = new DeleteEquipmentUseCase(equipmentRepository);
  const createBookingUseCase = new CreateBookingUseCase(bookingRepository, equipmentRepository, warningRepository, logRepository, userRepository);
  const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(bookingRepository, equipmentRepository, logRepository, userRepository, emailService);
  const bulkImportUseCase = new BulkImportStudentsUseCase(userRepository, emailService);
  const createUserUseCase = new CreateUserUseCase(userRepository, emailService);
  const issueWarningUseCase = new IssueWarningUseCase(warningRepository, logRepository, userRepository);
  const payPenaltyUseCase = new PayPenaltyUseCase(warningRepository);
  const clearWarningsUseCase = new ClearWarningsUseCase(warningRepository, logRepository, userRepository);

  // Controllers
  const authController = new AuthController(loginUseCase, forgotPasswordUseCase, resetPasswordUseCase, sendAdminCredentialsUseCase);
  const equipmentController = new EquipmentController(
    listEquipmentUseCase,
    addEquipmentUseCase,
    updateEquipmentUseCase,
    deleteEquipmentUseCase
  );
  const bookingController = new BookingController(createBookingUseCase, updateBookingStatusUseCase, bookingRepository);
  const userController = new UserController(userRepository, bulkImportUseCase, createUserUseCase);
  const dashboardController = new DashboardController();
  const penaltyController = new PenaltyController(issueWarningUseCase, payPenaltyUseCase, clearWarningsUseCase, warningRepository);
  const staffRequestController = new StaffRequestController(staffRequestRepository);

  // Health check
  router.get("/health", (req, res) => res.json({ status: "ok" }));
  router.get("/health/db", async (req, res) => {
    try {
      const result = await userRepository.query("SELECT 1 as connected");
      res.json({ 
        status: "ok", 
        database: "connected",
        timestamp: new Date().toISOString(),
        result: result[0]
      });
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        database: "disconnected",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API Routes
  router.use("/auth", authController.router);
  router.use("/users", userController.router);
  router.use("/equipment", authenticate, equipmentController.router);
  router.use("/bookings", authenticate, bookingController.router);
  router.use("/warnings", authenticate, penaltyController.router);
  router.use("/staff-requests", authenticate, staffRequestController.router);
  router.use("/dashboard", authenticate, authorize(["admin", "staff"]), dashboardController.router);

  return router;
};
