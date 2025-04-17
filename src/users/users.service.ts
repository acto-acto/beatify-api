import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

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
      },
    });
  }

  async update(userId: string, dto: UpdateUserDto) {
    const existingUsername = await this.prisma.user.findUnique({
      where: { user_name: dto.user_name },
    });

    if (existingUsername && existingUsername.id !== userId) {
      throw new BadRequestException('Username already exists');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail && existingEmail.id !== userId) {
      throw new BadRequestException('Email already exists');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        updated_at: new Date(),
      },
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
}
