import { UserRepository } from "@/src/adapters/repositories/UserRepository";
import bcrypt from "bcryptjs";

export class ResetPasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, otp: string, newPassword: string) {
    // We need to include the OTP fields in the fetched user
    const user = await this.userRepository.findByEmail(email, true);
    
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.resetOtp || !user.resetOtpExpiresAt) {
      throw new Error("No password reset request found. Please request a new one.");
    }

    // Check if OTP is correct
    if (user.resetOtp !== otp) {
      throw new Error("Invalid verification code");
    }

    // Check if OTP has expired
    if (new Date() > user.resetOtpExpiresAt) {
      throw new Error("Verification code has expired. Please request a new one.");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user record
    user.password = hashedPassword;
    user.resetOtp = null; // Clear OTP after success
    user.resetOtpExpiresAt = null;

    await this.userRepository.save(user);

    return { message: "Password has been successfully reset" };
  }
}
