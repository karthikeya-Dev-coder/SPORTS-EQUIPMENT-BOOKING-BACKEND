import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import { EmailService } from "@/src/infrastructure/services/EmailService";
import bcrypt from "bcryptjs";

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // For security, don't reveal if user exists. 
      // But for this university project, we can be direct.
      throw new Error("User with this email does not exist");
    }

    // Reset to a default secure password or generate one
    const tempPassword = "sports@" + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.emailService.sendPasswordResetEmail(user.email, user.name, tempPassword);
    
    return { message: "New temporary password sent to your email" };
  }
}
