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
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        user_name: true,
        full_name: true,
        avatar_url: true,
        created_at: true,
        last_player_state: true,
      },
    });
  }

  async update(userId: string, dto: UpdateUserDto) {
    if (dto.user_name) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { user_name: dto.user_name },
      });
      if (existingUsername && existingUsername.id !== userId) {
        throw new BadRequestException('Username already exists');
      }
    }

    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail && existingEmail.id !== userId) {
        throw new BadRequestException('Email already exists');
      }
    }

    const transformedData = {
      ...dto,
      updated_at: new Date(),
      last_player_state: dto.last_player_state
        ? JSON.parse(JSON.stringify(dto.last_player_state))
        : undefined,
    };

    return this.prisma.user.update({
      where: { id: userId },
      data: transformedData,
      select: {
        id: true,
        email: true,
        user_name: true,
        full_name: true,
        avatar_url: true,
        updated_at: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatches = await bcrypt.compare(
      dto.current_password,
      user.password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isNewPasswordSame = dto.new_password === dto.confirm_new_password;
    if (!isNewPasswordSame) {
      throw new BadRequestException(
        'New password and confirm new password do not match',
      );
    }

    const hashedNewPassword = await bcrypt.hash(dto.new_password, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password updated successfully' };
  }
}
