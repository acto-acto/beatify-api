import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.playlistsService.findAll(req.user.userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('playlist')
  findOne(@Request() req, @Query('name') name?: string) {
    if (!name) {
      throw new BadRequestException('Make sure to pass a name query parameter');
    }
    const userId = req?.user?.userId;
    return this.playlistsService.findOneByName(name, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() requestPayload: CreatePlaylistDto) {
    return this.playlistsService.create(requestPayload, req.user.userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOneById(@Request() req, @Param('id') id: string) {
    return this.playlistsService.findOneById(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() requestPayload: UpdatePlaylistDto,
  ) {
    return this.playlistsService.update(id, requestPayload, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }
}
