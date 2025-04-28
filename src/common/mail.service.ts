import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendResetPasswordEmail(
    email: string,
    userName: string,
    otp: string,
    token: string,
  ) {
    const frontendBaseUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendBaseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    const html = `
      <h3>Hello ${userName},</h3>
      <p>You requested to reset your password. You can do it in two ways:</p>
      <p><strong>Option 1: Enter the OTP</strong><br/><b>${otp}</b></p>
      <p><strong>Option 2: Use the reset link below</strong><br/>
      <a href="${resetUrl}">click here</a></p>
      <p>This link and OTP expire in 10 minutes.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `;

    const text = `
      Hello ${userName},

      You requested to reset your password. You can do it in two ways:

      Option 1: Enter the OTP — Your OTP is: ${otp}

      Option 2: Use the reset link:
      ${resetUrl}

      This link and OTP expire in 10 minutes.

      If you didn’t request this, you can ignore this email.
    `;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Instructions',
      html,
      text,
    });
  }
}
