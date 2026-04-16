import { WarningRepository } from "@/src/adapters/repositories/WarningRepository";
import { ActivityLogRepository } from "@/src/adapters/repositories/ActivityLogRepository";

export class IssueWarningUseCase {
  constructor(
    private warningRepository: WarningRepository,
    private logRepository: ActivityLogRepository
  ) {}

  async execute(data: {
    studentId: string;
    reason: string;
    level: 1 | 2 | 3;
    issuedBy: string;
    amount?: number;
  }) {
    const warning = await this.warningRepository.save({
      ...data,
      isPaid: false,
      issuedAt: new Date()
    });

    await this.logRepository.save({
      userId: data.issuedBy,
      action: "Warning Issued",
      details: `Level ${data.level} warning issued to student ${data.studentId}: ${data.reason}`,
      timestamp: new Date()
    });

    return warning;
  }
}

export class PayPenaltyUseCase {
  constructor(private warningRepository: WarningRepository) {}

  async execute(id: string) {
    const warning = await this.warningRepository.findById(id); 
    if (!warning) throw new Error("Warning not found");

    return this.warningRepository.save({
      ...warning,
      isPaid: true,
      paidAt: new Date()
    });
  }
}
