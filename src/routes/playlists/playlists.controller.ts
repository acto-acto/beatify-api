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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  create(@Body() createPlaylistDto: CreatePlaylistDto) {
    return this.playlistsService.create(createPlaylistDto);
  }

  @Get()
  findAll() {
    return this.playlistsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('playlist')
  findOne(@Request() req, @Query('name') name?: string) {
    if (name) {
      return this.playlistsService.findOneByName(name, req.user.userId);
    } else {
      throw new BadRequestException('make sure to pass a query parameter');
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    return this.playlistsService.update(+id, updatePlaylistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOneById(@Request() req, @Param('id') id: string) {
    return this.playlistsService.findOneById(id, req.user.userId);
  }
}
