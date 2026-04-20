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

  async sendOTPEmail(to: string, name: string, otp: string): Promise<boolean> {
    const mailOptions = {
      from: `"SportSync - Security" <${config.email.user}>`,
      to,
      subject: "🔑 Your Verification Code - SportSync",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: #1e3c72; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">🏅 SportSync</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px;">Security Verification</h2>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">Hi ${name},</p>
            <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">We received a request to reset your password. Use the verification code below to proceed. This code will expire in <strong>10 minutes</strong>.</p>
            
            <div style="margin: 35px 0; text-align: center;">
              <div style="display: inline-block; background: #f0f4ff; border: 2px dashed #1e3c72; border-radius: 12px; padding: 20px 40px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #1e3c72; letter-spacing: 8px;">${otp}</span>
              </div>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">If you didn't request this, you can safely ignore this email. Your account remains secure.</p>
            
            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} SportSync Administration • All rights reserved</p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      Logger.info(`✅ OTP email sent to ${to} | Code: ${otp}`);
      return true;
    } catch (error) {
      Logger.error(`❌ Failed to send OTP email to ${to}: ${error}`);
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

  async sendBookingReturnEmail(to: string, name: string, equipmentName: string): Promise<boolean> {
    const mailOptions = {
      from: `"SportSync - Equipment Booking" <${config.email.user}>`,
      to,
      subject: "✅ Equipment Return Confirmed",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Return Confirmed</h1>
            <p style="color: #e0f8ed; margin: 5px 0 0;">SportSync Equipment Booking</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
            <p style="color: #555; line-height: 1.6;">Thank you for returning the equipment. We have successfully processed the return for:</p>
            <div style="background: #ffffff; border: 2px solid #43e97b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #333;">${equipmentName}</p>
            </div>
            <p style="color: #555; line-height: 1.6;">Your booking for this item is now marked as returned. Thanks for keeping our sports equipment safe!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            <p style="color: #888; font-size: 13px;">Regards,<br><strong>Sports Administration Team</strong></p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      Logger.info(`✅ Return confirmation email sent to ${to} | Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      Logger.error(`❌ Failed to send return confirmation email to ${to}: ${error}`);
      return false;
    }
  }

  async sendAdminSeedEmail(to: string): Promise<boolean> {
    const mailOptions = {
      from: `"SportSync - Equipment Booking" <${config.email.user}>`,
      to,
      subject: "🛡️ SportSync - System Admin Credentials",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🛡️ System Admin</h1>
            <p style="color: #e0e0ff; margin: 5px 0 0;">SportSync Secured Credentials</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Admin Portal Access</h2>
            <p style="color: #555; line-height: 1.6;">As requested, here are the master seed credentials for the System Administrator account:</p>
            <div style="background: #ffffff; border: 2px solid #1e3c72; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #333; font-size: 16px;"><strong>👤 User ID:</strong> admin</p>
              <p style="margin: 5px 0; color: #333; font-size: 16px;"><strong>🔑 Password:</strong> <code style="background: #f0f0f0; padding: 3px 8px; border-radius: 4px;">admin123</code></p>
            </div>
            <p style="color: #e74c3c; font-weight: bold;">⚠️ Keep these credentials secure and do not share them unauthorizedly.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            <p style="color: #888; font-size: 13px;">Regards,<br><strong>System AI Assistant</strong></p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      Logger.info(`✅ Admin credentials email sent to ${to} | Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      Logger.error(`❌ Failed to send admin credentials email to ${to}: ${error}`);
      return false;
    }
  }
}
