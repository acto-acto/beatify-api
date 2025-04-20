import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { FileUploadService } from 'src/common/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService,
    private prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    let user = await this.userService.findById(req.user.userId);

    if (user && !user.avatar_url) {
      user.avatar_url = `https://ui-avatars.com/api/?name=${user.user_name}&format=PNG&uppercase=true&length=1&size=200&bold=true&background=random&color=fff`;
    }

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Multer.File,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    if (file) {
      if (user && user?.avatar_url) {
        const publicId = this.fileUploadService.extractPublicId(
          user?.avatar_url,
        );
        await this.fileUploadService.deleteFile(publicId);
      }
      if (user) {
        const uploadedFile = await this.fileUploadService.uploadFile(
          file.buffer,
          user?.user_name,
        );
        updateUserDto.avatar_url = uploadedFile;
      }
    }
    return this.userService.update(req.user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.userId, dto);
  }
}
