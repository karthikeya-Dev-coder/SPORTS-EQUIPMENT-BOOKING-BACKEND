import { WarningRepository } from "@/src/adapters/repositories/WarningRepository";
import { ActivityLogRepository } from "@/src/adapters/repositories/ActivityLogRepository";
import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import { Logger } from "@/src/shared/logger";

export class ClearWarningsUseCase {
  constructor(
    private warningRepository: WarningRepository,
    private logRepository: ActivityLogRepository,
    private userRepository: UserRepository
  ) {}

  async execute(studentId: string, adminId: string): Promise<void> {
    try {
      const [student, admin] = await Promise.all([
        this.userRepository.findById(studentId),
        this.userRepository.findById(adminId)
      ]);

      const studentName = student?.name || studentId;
      const adminName = admin?.name || adminId;

      await this.warningRepository.deleteAllByStudentId(studentId);
      
      await this.logRepository.save({
        userId: adminId,
        action: "Warnings Cleared",
        details: `All warnings cleared for student ${studentName} by admin ${adminName}`,
        timestamp: new Date()
      });
      
      Logger.info(`Cleared warnings for student ${studentName}`);
    } catch (error: any) {
      Logger.error(`Failed to clear warnings: ${error.message}`);
      throw error;
    }
  }
}
