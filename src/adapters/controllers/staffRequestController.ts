import { Request, Response, Router } from "express";
import { StaffRequestRepository } from "@/src/adapters/repositories/StaffRequestRepository";
import { authenticate, authorize } from '../../infrastructure/middleware/standalone_auth';
import { AuthRequest } from "../../shared/authMiddleware";

export class StaffRequestController {
  public router = Router();

  constructor(private repository: StaffRequestRepository) {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/", authenticate, authorize(["admin"]), this.listAll.bind(this));
    this.router.get("/my", authenticate, authorize(["staff"]), this.listMy.bind(this));
    this.router.post("/", authenticate, authorize(["staff"]), this.create.bind(this));
    this.router.patch("/:id/status", authenticate, authorize(["admin"]), this.updateStatus.bind(this));
  }

  private async listAll(req: Request, res: Response) {
    const list = await this.repository.findAll();
    return res.json(list);
  }

  private async listMy(req: AuthRequest, res: Response) {
    const list = await this.repository.findByStaffId(req.user!.id);
    return res.json(list);
  }

  private async create(req: AuthRequest, res: Response) {
    const result = await this.repository.save({
      ...req.body,
      staffId: req.user!.id,
      status: "pending"
    });
    return res.status(201).json(result);
  }

  private async updateStatus(req: Request, res: Response) {
    const { status } = req.body;
    const request = await this.repository.findById(req.params.id!);
    if (!request) return res.status(404).json({ message: "Request not found" });
    
    request.status = status;
    await this.repository.save(request);
    return res.json(request);
  }
}
