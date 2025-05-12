import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Post,
  Delete,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { FileUploadService } from 'src/common/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavouriteTrackDto } from './dto/favourite-track.dto';
import { FollowArtistDto } from './dto/follow-artist.dto';

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

    if (user && !user.profile?.avatarUrl) {
      if (user.profile) {
        user.profile.avatarUrl = `https://ui-avatars.com/api/?name=${user.profile.userName}&format=PNG&uppercase=true&length=1&size=200&bold=true&background=random&color=fff`;
      }
    }

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Request() req,
    @Body() requestPayload: UpdateUserDto,
    @UploadedFile() file: Multer.File,
  ) {
    const refinedPayload = {
      ...requestPayload,
      profile:
        requestPayload.profile && typeof requestPayload.profile === 'string'
          ? (() => {
              try {
                return JSON.parse(requestPayload.profile);
              } catch (error) {
                console.error('Failed to parse profile JSON:', error);
                throw new Error('Invalid profile format');
              }
            })()
          : requestPayload.profile || {},
    };

    if (file) {
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, profile: true },
      });

      if (user && user?.profile?.avatarUrl) {
        const publicId = this.fileUploadService.extractPublicId(
          user?.profile.avatarUrl,
        );

        await this.fileUploadService.deleteFile(publicId);
      }

      if (user) {
        const uploadedFileUrl = await this.fileUploadService.uploadFile(
          file.buffer,
          user?.profile?.userName ?? 'default-folder',
        );

        refinedPayload.profile.avatarUrl = uploadedFileUrl;
      }
    }

    return this.userService.update(req.user.userId, refinedPayload);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/change-password')
  changePassword(@Request() req, @Body() requestPayload: ChangePasswordDto) {
    return this.userService.changePassword(req.user.userId, requestPayload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/favourite-tracks')
  async getFavouriteTracks(@Request() req) {
    return this.userService.getFavouriteTracks(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/favourite-tracks')
  async addFavouriteTrack(
    @Request() req,
    @Body() requestPayload: FavouriteTrackDto,
  ) {
    return this.userService.addFavouriteTrack(
      req.user.userId,
      requestPayload.trackId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/favourite-tracks')
  async removeFavouriteTrack(
    @Request() req,
    @Body() requestPayload: FavouriteTrackDto,
  ) {
    return this.userService.removeFavouriteTrack(
      req.user.userId,
      requestPayload.trackId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/follow-artist')
  async getFollowedArtists(@Request() req) {
    return this.userService.getFollowedArtists(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/follow-artist')
  async FollowArtist(@Request() req, @Body() requestPayload: FollowArtistDto) {
    return this.userService.FollowArtist(
      req.user.userId,
      requestPayload.artistId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/follow-artist')
  async unfollowArtist(
    @Request() req,
    @Body() requestPayload: FollowArtistDto,
  ) {
    return this.userService.unfollowArtist(
      req.user.userId,
      requestPayload.artistId,
    );
  }
}
