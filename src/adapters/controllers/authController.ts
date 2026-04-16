import { Request, Response, Router } from "express";
import { LoginUseCase } from "@/src/application/usecases/auth/login";
import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import { Logger } from "@/src/shared/logger";
import { ForgotPasswordUseCase } from "@/src/application/usecases/auth/forgotPassword";

export class AuthController {
  public router = Router();

  constructor(
    private loginUseCase: LoginUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase
  ) {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post("/login", this.login.bind(this));
    this.router.post("/forgot-password", this.forgotPassword.bind(this));
  }

  private async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await this.forgotPasswordUseCase.execute(email);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  private async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute(email, password);
      return res.json(result);
    } catch (error: any) {
      Logger.error(`Login failed: ${error.message}`);
      return res.status(401).json({ message: error.message });
    }
  }
}
