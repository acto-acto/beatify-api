import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { addMinutes } from 'date-fns';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/common/mail.service';
import { ConfigService } from '@nestjs/config';
import { profile } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async signup(requestPayload: SignUpDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: requestPayload.email },
      select: { email: true },
    });

    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    const existingUsername = await this.prisma.profile.findUnique({
      where: { userName: requestPayload.userName },
      select: { userName: true },
    });

    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(requestPayload.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: requestPayload.email,
        password: hashedPassword,
        profile: {
          create: {
            userName: requestPayload.userName,
            fullName: requestPayload.fullName,
          },
        },
      },
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(requestPayload: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: requestPayload.email },
    });

    if (!user) throw new BadRequestException('Invalid credentials');

    const pwMatches = await bcrypt.compare(
      requestPayload.password,
      user.password,
    );

    if (!pwMatches) throw new BadRequestException('Invalid credentials');

    return this.generateTokens(user.id, user.email);
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(requestPayload: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: requestPayload.email },
      select: {
        id: true,
        email: true,
        resetOtp: true,
        resetToken: true,
        profile: {
          select: {
            userName: true,
          },
        },
      },
    });
    if (!user)
      throw new BadRequestException('No user exists with the provided email.');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = addMinutes(new Date(), 10);

    const jwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'reset-password',
    };
    const token = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: '10m',
    });

    await this.prisma.user.update({
      where: { email: requestPayload.email },
      data: {
        resetToken: token,
        resetOtp: otp,
        resetOtpExpiry: otpExpiry,
      },
    });

    await this.mailService.sendResetPasswordEmail(
      user.email,
      user.profile?.userName ?? 'dear user',
      otp,
      token,
    );

    return { message: 'Reset instructions sent to your email' };
  }

  async verifyOtp(requestPayload: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { resetOtp: requestPayload.otp },
      select: { resetOtp: true, resetOtpExpiry: true, resetToken: true },
    });

    if (
      !user ||
      user.resetOtp !== requestPayload.otp ||
      !user.resetOtpExpiry ||
      user.resetOtpExpiry < new Date()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const frontendBaseUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendBaseUrl}/auth/reset-password?token=${encodeURIComponent(user.resetToken || '')}`;

    return {
      message: 'OTP is valid',
      resetUrl: resetUrl,
    };
  }

  async resetPassword(requestPayload: ResetPasswordDto) {
    let userId = '';

    if (requestPayload.token) {
      try {
        const payload = await this.jwtService.verifyAsync(requestPayload.token);
        userId = payload.sub;
      } catch (e) {
        throw new BadRequestException('Invalid or expired token');
      }
    }

    const isNewPasswordSame =
      requestPayload.newPassword === requestPayload.confirmNewPassword;
    if (!isNewPasswordSame) {
      throw new BadRequestException(
        'New password and confirm new password do not match',
      );
    }

    const hashedPassword = await bcrypt.hash(requestPayload.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refreshToken },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async invalidateTokens(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
