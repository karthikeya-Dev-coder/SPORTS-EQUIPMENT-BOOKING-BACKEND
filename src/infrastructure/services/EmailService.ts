import nodemailer from "nodemailer";
import { Logger } from "@/src/shared/logger";
import { config } from "@/src/shared/config";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string, password: string): Promise<boolean> {
    const mailOptions = {
      from: `"Sports Equipment Booking" <noreply@sports.edu>`,
      to,
      subject: "Your Sports Portal Account Details",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome, ${name}!</h2>
          <p>Your account has been created on the Sports Equipment Booking portal.</p>
          <p><strong>Username:</strong> ${to}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
          <p>Please change your password after your first login.</p>
          <br>
          <p>Regards,<br>Sports Administration</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      Logger.info(`Successfully sent welcome email to ${to}`);
      return true;
    } catch (error) {
      Logger.error(`Failed to send email to ${to}: ${error}`);
      return false;
    }
  }
}
