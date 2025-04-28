import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        profile: true,
      },
    });

    if (user?.profile?.lastPlayerState) {
      try {
        user.profile.lastPlayerState =
          typeof user.profile.lastPlayerState === 'string'
            ? JSON.parse(user.profile.lastPlayerState)
            : user.profile.lastPlayerState;
      } catch (e) {
        console.error('Error parsing lastPlayerState:', e);
        user.profile.lastPlayerState = null;
      }
    }

    return user;
  }

  async update(userId: string, requestPayload: UpdateUserDto) {
    if (requestPayload.profile?.userName) {
      const existingUsername = await this.prisma.profile.findUnique({
        where: { userName: requestPayload.profile.userName },
      });

      if (existingUsername && existingUsername.userId !== userId) {
        throw new BadRequestException('Username already exists');
      }
    }

    if (requestPayload.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: requestPayload.email },
      });

      if (existingEmail && existingEmail.id !== userId) {
        throw new BadRequestException('Email already exists');
      }
    }

    let updatedProfile = { ...requestPayload.profile };

    if (requestPayload.profile?.lastPlayerState) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { profile: { select: { lastPlayerState: true } } },
      });

      let existingState = {};

      if (user?.profile?.lastPlayerState) {
        try {
          existingState =
            typeof user.profile.lastPlayerState === 'string'
              ? JSON.parse(user.profile.lastPlayerState)
              : user.profile.lastPlayerState;
        } catch (e) {
          console.error('Error parsing lastPlayerState:', e);
        }
      }

      updatedProfile.lastPlayerState = {
        ...existingState,
        ...requestPayload.profile.lastPlayerState,
      };
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: requestPayload.email ? { email: requestPayload.email } : {},
      }),

      this.prisma.profile.update({
        where: { userId: userId },
        data:
          Object.keys(updatedProfile).length > 0
            ? {
                ...updatedProfile,
                lastPlayerState: updatedProfile.lastPlayerState
                  ? JSON.stringify(updatedProfile.lastPlayerState)
                  : undefined,
              }
            : {},
      }),
    ]);

    return { message: 'Profile updated successfully' };
  }

  async changePassword(userId: string, requestPayload: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatches = await bcrypt.compare(
      requestPayload.currentPassword,
      user.password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isNewPasswordSame =
      requestPayload.newPassword === requestPayload.confirmNewPassword;
    if (!isNewPasswordSame) {
      throw new BadRequestException(
        'New password and confirm new password do not match',
      );
    }

    const hashedNewPassword = await bcrypt.hash(requestPayload.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password updated successfully' };
  }
}
