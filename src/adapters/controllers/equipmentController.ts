import { Request, Response, Router } from "express";
import { ListEquipmentUseCase } from "@/src/application/usecases/equipment/listEquipment";
import { AddEquipmentUseCase, UpdateEquipmentUseCase, DeleteEquipmentUseCase } from "@/src/application/usecases/equipment/equipmentManagement";
import { Logger } from "@/src/shared/logger";
import { authenticate, authorize } from '../../infrastructure/middleware/standalone_auth';
import { AuthRequest } from "../../shared/authMiddleware";

export class EquipmentController {
  public router = Router();

  constructor(
    private listEquipmentUseCase: ListEquipmentUseCase,
    private addEquipmentUseCase: AddEquipmentUseCase,
    private updateEquipmentUseCase: UpdateEquipmentUseCase,
    private deleteEquipmentUseCase: DeleteEquipmentUseCase
  ) {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/", this.list.bind(this));
    this.router.get("/assigned", authenticate, authorize(["staff"]), this.listAssigned.bind(this));
    this.router.post("/", authenticate, authorize(["admin"]), this.add.bind(this));
    this.router.patch("/:id", authenticate, authorize(["admin"]), this.update.bind(this));
    this.router.delete("/:id", authenticate, authorize(["admin"]), this.remove.bind(this));
  }

  private async list(req: Request, res: Response) {
    try {
      const equipment = await this.listEquipmentUseCase.execute();
      return res.json(equipment);
    } catch (error: any) {
      Logger.error(`List equipment failed: ${error.message}`);
      return res.status(500).json({ message: error.message });
    }
  }

  private async listAssigned(req: AuthRequest, res: Response) {
    try {
      const staffId = req.user!.id;
      const equipment = await this.listEquipmentUseCase.execute(); 
      // Filter by staffId. In production, add a findByStaffId use case.
      return res.json(equipment.filter(e => e.assignedStaffId === staffId));
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  private async add(req: Request, res: Response) {
    try {
      const result = await this.addEquipmentUseCase.execute(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  private async update(req: Request, res: Response) {
    try {
      const result = await this.updateEquipmentUseCase.execute(req.params.id!, req.body);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  private async remove(req: Request, res: Response) {
    try {
      await this.deleteEquipmentUseCase.execute(req.params.id!);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
