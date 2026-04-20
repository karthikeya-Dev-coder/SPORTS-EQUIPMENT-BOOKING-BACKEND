import { Request, Response, Router } from "express";
import { LoginUseCase } from "@/src/application/usecases/auth/login";
import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import { Logger } from "@/src/shared/logger";
import { ForgotPasswordUseCase } from "@/src/application/usecases/auth/forgotPassword";
import { SendAdminCredentialsUseCase } from "@/src/application/usecases/auth/sendAdminCredentials";
import { authenticate, authorize } from "../../infrastructure/middleware/standalone_auth";

import { ResetPasswordUseCase } from "@/src/application/usecases/auth/resetPassword";

export class AuthController {
  public router = Router();

  constructor(
    private loginUseCase: LoginUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private sendAdminCredentialsUseCase: SendAdminCredentialsUseCase
  ) {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post("/login", this.login.bind(this));
    this.router.post("/forgot-password", this.forgotPassword.bind(this));
    this.router.post("/reset-password", this.resetPassword.bind(this));
    this.router.post("/admin/send-credentials", authenticate, authorize(["admin"]), this.sendAdminCredentials.bind(this));
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

  private async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, code, and new password are required." });
      }
      const result = await this.resetPasswordUseCase.execute(email, otp, newPassword);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  private async login(req: Request, res: Response) {
    try {
      // Extract either email or userId based on who is logging in
      const { email, userId, password } = req.body;
      const loginIdentifier = email || userId;

      if (!loginIdentifier) {
        return res.status(400).json({ message: "Please provide an email or userId" });
      }

      const result = await this.loginUseCase.execute(loginIdentifier, password);
      return res.json(result);
    } catch (error: any) {
      Logger.error(`Login failed: ${error.message}`);
      return res.status(401).json({ message: error.message });
    }
  }

  private async sendAdminCredentials(req: Request, res: Response) {
    try {
      const { targetEmail } = req.body;
      if (!targetEmail) return res.status(400).json({ message: "Email required" });
      const result = await this.sendAdminCredentialsUseCase.execute(targetEmail);
      return res.json({ success: result, message: "Credentials sent successfully." });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
