import bcrypt from "bcryptjs";
import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import { EmailService } from "@/src/infrastructure/services/EmailService";
import { Logger } from "@/src/shared/logger";
import { generateRandomPassword } from "@/src/shared/utils";

interface ImportStudent {
  name: string;
  email: string;
  department?: string;
}

export class BulkImportStudentsUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(students: ImportStudent[], sendEmail: boolean) {
    const results = [];

    for (const student of students) {
      try {
        const studentPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(studentPassword, 10);

        const existing = await this.userRepository.findByEmail(student.email);
        if (existing) {
          results.push({ email: student.email, status: "skipped", reason: "Already exists" });
          continue;
        }

        const newUser = await this.userRepository.save({
          name: student.name,
          email: student.email,
          role: "student",
          password: hashedPassword,
          isActive: true,
          department: student.department
        });

        if (sendEmail) {
          await this.emailService.sendWelcomeEmail(student.email, student.name, studentPassword);
        }

        results.push({ email: student.email, id: newUser.id, status: "imported" });
      } catch (error: any) {
        Logger.error(`Failed to import ${student.email}: ${error.message}`);
        results.push({ email: student.email, status: "failed", reason: error.message });
      }
    }

    return results;
  }
}
