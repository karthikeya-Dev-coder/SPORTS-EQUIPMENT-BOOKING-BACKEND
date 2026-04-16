import { Request, Response, Router } from "express";
import { CreateBookingUseCase } from "@/src/application/usecases/booking/createBooking";
import { UpdateBookingStatusUseCase } from "@/src/application/usecases/booking/updateBookingStatus";
import { BookingRepository } from "@/src/adapters/repositories/BookingRepository";
import { AuthRequest, authenticate, authorize } from "../../shared/authMiddleware";
import { Logger } from "@/src/shared/logger";

export class BookingController {
  public router = Router();

  constructor(
    private createBookingUseCase: CreateBookingUseCase,
    private updateBookingStatusUseCase: UpdateBookingStatusUseCase,
    private bookingRepository: BookingRepository
  ) {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/", authenticate, authorize(["admin", "staff"]), this.listAll.bind(this));
    this.router.get("/my", authenticate, this.listMy.bind(this));
    this.router.post("/", authenticate, this.create.bind(this));
    this.router.patch("/:id/status", authenticate, authorize(["admin", "staff"]), this.updateStatus.bind(this));
    this.router.post("/:id/cancel", authenticate, this.cancel.bind(this));
  }

  private async listMy(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user!.id;
      const bookings = await this.bookingRepository.findByStudentId(studentId);
      return res.json(bookings);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  private async listAll(req: Request, res: Response) {
    try {
      const query = typeof req.query.q === "string" ? req.query.q : undefined;
      const bookings = await this.bookingRepository.findAll(query);
      return res.json(bookings);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  private async cancel(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const booking = await this.bookingRepository.findById(id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      // Safety: Only student who created it can cancel if it's still pending
      if (booking.studentId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (booking.status !== "pending") {
        return res.status(400).json({ message: "Only pending bookings can be cancelled" });
      }

      booking.status = "rejected" as any; // Using rejected as 'cancelled' or we could add a new enum
      await this.bookingRepository.save(booking);
      return res.json({ message: "Booking cancelled successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  private async create(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.id;
      if (!studentId) return res.status(401).json({ message: "Unauthorized" });

      const booking = await this.createBookingUseCase.execute({
        ...req.body,
        studentId
      });
      return res.status(201).json(booking);
    } catch (error: any) {
      Logger.error(`Booking creation failed: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }

  private async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.id;
      const userName = req.user!.email; // Temporary

      const result = await this.updateBookingStatusUseCase.execute(
        id as string, 
        status as any, 
        userId, 
        userName
      );
      return res.json(result);
    } catch (error: any) {
      Logger.error(`Status update failed: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }
}
