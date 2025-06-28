import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async create(payload: CreatePlaylistDto, userId: string) {
    const existingPlaylist = await this.prisma.playlist.findFirst({
      where: {
        name: payload.name,
        userId,
      },
    });

    if (existingPlaylist) {
      throw new BadRequestException(
        'You already have a playlist with this name',
      );
    }

    const newPlaylist = await this.prisma.playlist.create({
      data: {
        name: payload.name,
        userId,
      },
    });

    if (payload.trackId) {
      const existingTrack = await this.prisma.track.findFirst({
        where: {
          id: payload.trackId,
        },
      });

      if (!existingTrack) {
        throw new BadRequestException('The provided track does not exist');
      }

      await this.prisma.playlistTrack.create({
        data: {
          playlistId: newPlaylist.id,
          trackId: payload.trackId,
        },
      });
    }

    return { message: 'playlist has been created successfully' };
  }

  async findAll(userId?: string, collection?: 'user' | 'app') {
    let playlists;

    if (collection === 'user') {
      if (!userId) {
        throw new UnauthorizedException(
          "You don't have access to this collection of playlists",
        );
      }
      const userPlaylists = await this.prisma.playlist.findMany({
        where: {
          userId,
        },
        orderBy: {
          name: 'asc',
        },
        include: {
          tracks: true,
        },
      });

      playlists = userPlaylists;
    } else if (collection === 'app') {
      const appPlaylists = await this.prisma.playlist.findMany({
        where: {
          userId: null,
        },
        orderBy: {
          name: 'asc',
        },
        include: {
          tracks: true,
        },
      });

      playlists = appPlaylists;
    } else {
      const appPlaylists = await this.prisma.playlist.findMany({
        where: {
          userId: null,
        },
        orderBy: {
          name: 'asc',
        },
        include: {
          tracks: true,
        },
      });

      if (userId) {
        const userPlaylists = await this.prisma.playlist.findMany({
          where: {
            userId,
          },
          orderBy: {
            name: 'asc',
          },
          include: {
            tracks: true,
          },
        });

        playlists = appPlaylists.concat(userPlaylists);
      } else {
        playlists = appPlaylists;
      }
    }

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
      include: {
        artist: true,
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
      include: {
        artist: true,
      },
    });

    let updatedTracks = tracks.map((track) => ({
      ...track,
      isFavourited: false,
      isArtistFollowed: false,
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

          const isArtistFollowed =
            await this.prisma.userFollowArtist.findUnique({
              where: {
                userId_artistId: {
                  userId,
                  artistId: track.artist.id,
                },
              },
            });

          return {
            ...track,
            isFavourited: !!isFavourited,
            isArtistFollowed: !!isArtistFollowed,
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

  async update(id: string, requestPayload: UpdatePlaylistDto, userId: string) {
    const userOwnsplaylist = await this.prisma.playlist.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!userOwnsplaylist) {
      throw new UnauthorizedException("You can't modify this playlist");
    }

    if (requestPayload.trackId) {
      const trackExistsInPlaylist = await this.prisma.playlistTrack.findFirst({
        where: {
          playlistId: id,
          trackId: requestPayload.trackId,
        },
      });

      if (trackExistsInPlaylist) {
        throw new BadRequestException('Track already exists in this playlist');
      }

      await this.prisma.playlistTrack.create({
        data: {
          playlistId: id,
          trackId: requestPayload.trackId,
        },
      });
    }

    return { message: 'playlist has been updated successfully' };
  }

  remove(id: string) {
    return `This action removes a #${id} playlist`;
  }
}
