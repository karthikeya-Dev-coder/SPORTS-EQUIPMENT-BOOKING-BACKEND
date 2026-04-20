import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import { EmailService } from "@/src/infrastructure/services/EmailService";
import bcrypt from "bcryptjs";
import { generateRandomPassword } from "@/src/shared/utils";

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User with this email does not exist");
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiry

    user.resetOtp = otp;
    user.resetOtpExpiresAt = expiresAt;
    
    await this.userRepository.save(user);

    await this.emailService.sendOTPEmail(user.email, user.name, otp);
    
    return { message: "6-digit verification code sent to your email" };
  }
}
