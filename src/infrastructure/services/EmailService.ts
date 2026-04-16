import nodemailer from "nodemailer";
import { Logger } from "@/src/shared/logger";
import { config } from "@/src/shared/config";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465, // true for 465, false for 587
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      tls: {
        rejectUnauthorized: false, // Avoid self-signed certificate issues
      },
    });

    // Verify connection on startup
    this.transporter.verify((error, success) => {
      if (error) {
        Logger.error(`Email transporter verification failed: ${error.message}`);
      } else {
        Logger.info("✅ Email transporter is ready to send real emails via Gmail");
      }
    });
  }

  async sendWelcomeEmail(to: string, name: string, password: string): Promise<boolean> {
    const mailOptions = {
      from: `"SportSync - Equipment Booking" <${config.email.user}>`,
      to,
      subject: "🏅 Welcome to SportSync - Your Account Details",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏅 SportSync</h1>
            <p style="color: #e0e0ff; margin: 5px 0 0;">Sports Equipment Booking Portal</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
            <p style="color: #555; line-height: 1.6;">Your account has been created on the Sports Equipment Booking portal. Use the credentials below to log in:</p>
            <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>📧 Username:</strong> ${to}</p>
              <p style="margin: 5px 0; color: #333;"><strong>🔑 Temporary Password:</strong> <code style="background: #f0f0f0; padding: 3px 8px; border-radius: 4px; font-size: 15px;">${password}</code></p>
            </div>
            <p style="color: #e74c3c; font-weight: bold;">⚠️ Please change your password after your first login.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            <p style="color: #888; font-size: 13px;">Regards,<br><strong>Sports Administration Team</strong></p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      Logger.info(`✅ Welcome email sent to ${to} | Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      Logger.error(`❌ Failed to send welcome email to ${to}: ${error}`);
      return false;
    }
  }

  async sendPasswordResetEmail(to: string, name: string, tempPassword: string): Promise<boolean> {
    const mailOptions = {
      from: `"SportSync - Equipment Booking" <${config.email.user}>`,
      to,
      subject: "🔐 SportSync - Password Reset",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔐 Password Reset</h1>
            <p style="color: #ffe0e6; margin: 5px 0 0;">SportSync Equipment Booking</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
            <p style="color: #555; line-height: 1.6;">We received a request to reset your password. Your new temporary password is:</p>
            <div style="background: #ffffff; border: 2px solid #f5576c; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 22px; font-weight: bold; color: #333; letter-spacing: 2px;">${tempPassword}</p>
            </div>
            <p style="color: #e74c3c; font-weight: bold;">⚠️ Please log in and change your password immediately.</p>
            <p style="color: #888; font-size: 13px;">If you did not request this reset, please contact the administrator.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            <p style="color: #888; font-size: 13px;">Regards,<br><strong>Sports Administration Team</strong></p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      Logger.info(`✅ Password reset email sent to ${to} | Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      Logger.error(`❌ Failed to send password reset email to ${to}: ${error}`);
      return false;
    }
  }
}
