import { Request, Response, Router } from "express";
import { IssueWarningUseCase, PayPenaltyUseCase } from "@/src/application/usecases/penalty/penaltyManagement";
import { ClearWarningsUseCase } from "@/src/application/usecases/penalty/clearWarnings";
import { WarningRepository } from "@/src/adapters/repositories/WarningRepository";
import { authenticate, authorize } from '../../infrastructure/middleware/standalone_auth';
import { AuthRequest } from "../../shared/authMiddleware";
import { Logger } from "@/src/shared/logger";

export class PenaltyController {
  public router = Router();

  constructor(
    private issueWarningUseCase: IssueWarningUseCase,
    private payPenaltyUseCase: PayPenaltyUseCase,
    private clearWarningsUseCase: ClearWarningsUseCase,
    private warningRepository: WarningRepository
  ) {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/", authenticate, authorize(["admin", "staff"]), this.listAll.bind(this));
    this.router.get("/my", authenticate, this.listMy.bind(this));
    this.router.get("/student/:id", authenticate, this.listStudentWarnings.bind(this));
    this.router.post("/", authenticate, authorize(["admin", "staff"]), this.issue.bind(this));
    this.router.patch("/:id/pay", authenticate, authorize(["admin", "staff"]), this.pay.bind(this));
    this.router.delete("/student/:id", authenticate, authorize(["admin", "staff"]), this.clear.bind(this));
  }

  private async listMy(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user!.id;
      const warnings = await this.warningRepository.findByStudentId(studentId);
      return res.json(warnings);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  private async listAll(req: AuthRequest, res: Response) {
    try {
      let issuedBy: string | undefined;
      
      // Staff only see warnings they issued
      if (req.user!.role === "staff") {
        issuedBy = req.user!.id;
      }

      const list = await this.warningRepository.findAll(issuedBy);
      return res.json(list);
    } catch (error: any) {
      Logger.error("Failed to list all warnings:", error);
      return res.status(500).json({ message: "Internal server error while fetching warnings", error: error.message });
    }
  }

  private async listStudentWarnings(req: Request, res: Response) {
    try {
      const list = await this.warningRepository.findByStudentId(req.params.id as string);
      return res.json(list);
    } catch (error: any) {
      Logger.error("Failed to list student warnings:", error);
      return res.status(500).json({ message: "Internal server error while fetching student warnings", error: error.message });
    }
  }

  private async issue(req: AuthRequest, res: Response) {
    try {
      const result = await this.issueWarningUseCase.execute({
        ...req.body,
        issuedBy: req.user!.id
      });
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  private async pay(req: Request, res: Response) {
    try {
      const result = await this.payPenaltyUseCase.execute(req.params.id as string);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  private async clear(req: AuthRequest, res: Response) {
    try {
      await this.clearWarningsUseCase.execute(req.params.id as string, req.user!.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
