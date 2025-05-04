import { Injectable } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  create(createPlaylistDto: CreatePlaylistDto) {
    return 'This action adds a new playlist';
  }

  async findAll() {
    const playlists = await this.prisma.playlist.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        tracks: true,
      },
    });

    const trackIds = playlists.flatMap((playlist) =>
      playlist.tracks.map((playlistTrack) => playlistTrack.trackId),
    );

    const tracks = await this.prisma.track.findMany({
      where: {
        id: {
          in: trackIds,
        },
      },
    });

    const playlistsWithTracks = playlists.map((playlist) => ({
      ...playlist,
      tracks: playlist.tracks.map((playlistTrack) =>
        tracks.find((track) => track.id === playlistTrack.trackId),
      ),
    }));

    return playlistsWithTracks;
  }

  findOne(id: number) {
    return `This action returns a #${id} playlist`;
  }

  update(id: number, updatePlaylistDto: UpdatePlaylistDto) {
    return `This action updates a #${id} playlist`;
  }

  remove(id: number) {
    return `This action removes a #${id} playlist`;
  }
}
