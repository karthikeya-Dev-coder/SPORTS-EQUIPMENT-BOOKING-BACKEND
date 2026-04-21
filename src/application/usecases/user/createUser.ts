import bcrypt from "bcryptjs";
import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import { generateRandomPassword } from "@/src/shared/utils";
import { EmailService } from "@/src/infrastructure/services/EmailService";
import { UserRole } from "@/src/application/domain/entities";

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) { }

  async execute(data: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    sendEmail: boolean;
  }) {
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new Error("User already exists with this email");

    const user = await this.userRepository.save({
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      password: hashedPassword,
      isActive: true
    });

    if (data.sendEmail) {
      await this.emailService.sendWelcomeEmail(data.email, data.name, randomPassword);
    }

    return user;
  }
}
