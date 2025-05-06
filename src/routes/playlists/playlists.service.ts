import { BadRequestException, Injectable } from '@nestjs/common';
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
      orderBy: {
        name: 'asc',
      },
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

  async findOneById(id: string, userId?: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id },
      include: {
        tracks: true,
      },
    });

    if (!playlist) {
      throw new BadRequestException('Playlist does not exist');
    }

    const trackIds = playlist.tracks.map(
      (playlistTrack) => playlistTrack.trackId,
    );

    const tracks = await this.prisma.track.findMany({
      where: {
        id: {
          in: trackIds,
        },
      },
    });

    let updatedTracks = tracks.map((track) => ({
      ...track,
      isFavourited: false,
    }));

    if (userId) {
      updatedTracks = await Promise.all(
        tracks.map(async (track) => {
          const isFavourited = await this.prisma.favouriteTrack.findUnique({
            where: {
              userId_trackId: {
                userId,
                trackId: track.id,
              },
            },
          });

          return {
            ...track,
            isFavourited: !!isFavourited,
          };
        }),
      );
    }

    const playlistWithTracks = {
      ...playlist,
      tracks: updatedTracks,
    };

    return playlistWithTracks;
  }

  async findOneByName(name: string, userId?: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { name },
      include: {
        tracks: true,
      },
    });

    if (!playlist) {
      throw new BadRequestException('Playlist does not exist');
    }

    const trackIds = playlist.tracks.map(
      (playlistTrack) => playlistTrack.trackId,
    );

    const tracks = await this.prisma.track.findMany({
      where: {
        id: {
          in: trackIds,
        },
      },
    });

    let updatedTracks = tracks.map((track) => ({
      ...track,
      isFavourited: false,
    }));

    if (userId) {
      updatedTracks = await Promise.all(
        tracks.map(async (track) => {
          const isFavourited = await this.prisma.favouriteTrack.findUnique({
            where: {
              userId_trackId: {
                userId,
                trackId: track.id,
              },
            },
          });

          return {
            ...track,
            isFavourited: !!isFavourited,
          };
        }),
      );
    }

    const playlistWithTracks = {
      ...playlist,
      tracks: updatedTracks,
    };

    return playlistWithTracks;
  }

  update(id: number, updatePlaylistDto: UpdatePlaylistDto) {
    return `This action updates a #${id} playlist`;
  }

  remove(id: number) {
    return `This action removes a #${id} playlist`;
  }
}
