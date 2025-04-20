import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { addMinutes } from 'date-fns';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/common/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignUpDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { user_name: dto.user_name },
    });

    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        user_name: dto.user_name,
        full_name: dto.full_name,
        password: hashedPassword,
      },
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const pwMatches = await bcrypt.compare(dto.password, user.password);

    if (!pwMatches) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.email);
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refresh_token !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
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
      where: { email: dto.email },
      data: {
        reset_token: token,
        reset_otp: otp,
        reset_otp_expiry: otpExpiry,
      },
    });

    await this.mailService.sendResetPasswordEmail(
      user.email,
      user.user_name,
      otp,
      token,
    );

    return { message: 'Reset instructions sent to your email' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { reset_otp: dto.otp },
    });

    if (
      !user ||
      user.reset_otp !== dto.otp ||
      !user.reset_otp_expiry ||
      user.reset_otp_expiry < new Date()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const frontendBaseUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${encodeURIComponent(user.reset_token || '')}`;

    return {
      message: 'OTP is valid',
      reset_url: resetUrl,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let userId = '';

    if (dto.token) {
      try {
        const payload = await this.jwtService.verifyAsync(dto.token);
        userId = payload.sub;
      } catch (e) {
        throw new BadRequestException('Invalid or expired token');
      }
    }

    const isNewPasswordSame = dto.new_password === dto.confirm_new_password;
    if (!isNewPasswordSame) {
      throw new BadRequestException(
        'New password and confirm new password do not match',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.new_password, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_otp: null,
        reset_otp_expiry: null,
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
      data: { refresh_token: refreshToken },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async invalidateTokens(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: null },
    });
  }
}
