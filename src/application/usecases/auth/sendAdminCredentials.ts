import { EmailService } from "@/src/infrastructure/services/EmailService";
import { Logger } from "@/src/shared/logger";

export class SendAdminCredentialsUseCase {
  constructor(private emailService: EmailService) {}

  async execute(targetEmail: string): Promise<boolean> {
    try {
      const success = await this.emailService.sendAdminSeedEmail(targetEmail);
      if (!success) {
        throw new Error("Failed to send credentials via email service.");
      }
      return true;
    } catch (error: any) {
      Logger.error(`Error in SendAdminCredentialsUseCase: ${error.message}`);
      throw error;
    }
  }
}
