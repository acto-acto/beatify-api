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
  Optional,
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

  @Get()
  findAll() {
    return this.playlistsService.findAll();
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOneById(@Request() req, @Param('id') id: string) {
    return this.playlistsService.findOneById(id, req.user.userId);
  }
}
