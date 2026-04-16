import { Request, Response, Router } from "express";
import { BulkImportStudentsUseCase } from "@/src/application/usecases/user/bulkImportStudents";
import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import { authenticate, authorize } from '../../infrastructure/middleware/standalone_auth';
import { AuthRequest } from "../../infrastructure/middleware/standalone_auth";
import { Logger } from "@/src/shared/logger";
import { CreateUserUseCase } from "@/src/application/usecases/user/createUser";
import { EmailService } from "@/src/infrastructure/services/EmailService";

export class UserController {
  public router = Router();

  constructor(
    private userRepository: UserRepository,
    private bulkImportUseCase: BulkImportStudentsUseCase,
    private createUserUseCase: CreateUserUseCase
  ) {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/", authenticate, authorize(["admin", "staff"]), this.list.bind(this));
    this.router.post("/", authenticate, authorize(["admin"]), this.create.bind(this));
    this.router.get("/students", authenticate, authorize(["admin", "staff"]), this.getStudents.bind(this));
    this.router.post("/bulk-import", authenticate, authorize(["admin"]), this.bulkImport.bind(this));
    this.router.post("/me/resend-credentials", authenticate, this.resendProfileCredentials.bind(this));
    this.router.post("/:id/resend-credentials", authenticate, authorize(["admin"]), this.resendUserCredentials.bind(this));
    this.router.patch("/:id", authenticate, authorize(["admin"]), this.update.bind(this));
    this.router.delete("/:id", authenticate, authorize(["admin"]), this.remove.bind(this));
  }

  private async resendUserCredentials(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.userRepository.findById(id as string);
      if (!user) return res.status(404).json({ message: "User not found" });

      const emailService = new EmailService();
      await emailService.sendWelcomeEmail(user.email, user.name, "sports@123");
      return res.json({ message: "Credentials sent successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  private async update(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findById(req.params.id as string);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const updated = await this.userRepository.save({ ...user, ...req.body });
      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  private async remove(req: Request, res: Response) {
    try {
      await this.userRepository.delete(req.params.id as string);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  private async create(req: Request, res: Response) {
    try {
      const { name, email, role, department, sendEmail } = req.body;
      const user = await this.createUserUseCase.execute({
        name, email, role, department, sendEmail: !!sendEmail
      });
      return res.status(201).json(user);
    } catch (error: any) {
      Logger.error(`User creation failed: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }

  private async resendProfileCredentials(req: AuthRequest, res: Response) {
    try {
      const { email } = req.body;
      const user = await this.userRepository.findById(req.user!.id as string);
      
      if (!user) return res.status(404).json({ message: "User not found" });

      // In a real system, you'd reset the password. 
      // For this "seed data" request, we send the default seed password.
      const emailService = new EmailService(); 
      await emailService.sendWelcomeEmail(email || user.email, user.name, "sports@123");

      return res.json({ message: `Credentials sent to ${email || user.email}` });
    } catch (error: any) {
      Logger.error(`Resend credentials failed: ${error.message}`);
      return res.status(500).json({ message: error.message });
    }
  }

  private async list(req: Request, res: Response) {
    const query = req.query.q as string;
    const users = await this.userRepository.findAll(query);
    return res.json(users);
  }

  private async getStudents(req: Request, res: Response) {
    const query = req.query.q as string;
    const users = await this.userRepository.findAll(query);
    return res.json(users.filter(u => u.role === "student"));
  }

  private async bulkImport(req: AuthRequest, res: Response) {
    try {
      const { students, sendCredentials } = req.body;
      const result = await this.bulkImportUseCase.execute(students, sendCredentials);
      return res.status(201).json(result);
    } catch (error: any) {
      Logger.error(`Bulk import failed: ${error.message}`);
      return res.status(500).json({ message: error.message });
    }
  }
}
