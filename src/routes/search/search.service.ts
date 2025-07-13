import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchEverything(query: string, userId: string) {
    if (userId) {
      await this.addSearchQuery(userId, query);
    }

    return await Promise.all([
      this.prisma.track.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        include: { artist: true },
      }),

      this.prisma.album.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        include: {
          tracks: true,
        },
      }),

      this.prisma.artist.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        include: {
          followers: true,
          tracks: true,
        },
      }),

      this.prisma.playlist.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          ...(userId ? {} : { userId: null }),
        },
        include: {
          tracks: true,
        },
      }),
    ]).then(([tracks, albums, artists, playlists]) => ({
      tracks,
      albums,
      artists: artists.map((artist) => ({
        ...artist,
        isFollowed: !!artist.followers.some(
          (follower) => follower.userId === userId,
        ),
        followers: artist.followers.length,
      })),
      playlists,
    }));
  }

  async getSearchQueries(userId: string) {
    if (!userId) {
      throw new UnauthorizedException(
        'You are not allowed to access this resource',
      );
    }

    const searchItem = await this.prisma.searchItem.findMany({
      where: { userId },
    });
    return searchItem;
  }

  async addSearchQuery(userId, query) {
    if (!userId) {
      return;
    }

    const searchItem = await this.prisma.searchItem.findUnique({
      where: {
        query,
      },
    });

    if (searchItem) {
      return;
    }

    return await this.prisma.searchItem.create({
      data: {
        query,
        userId,
      },
    });
  }

  async removeSearchQuery(userId, id) {
    if (!userId) {
      throw new UnauthorizedException('authenticate to perform this action');
    }

    const queryItem = await this.prisma.searchItem.findFirst({
      where: {
        id,
      },
    });

    if (!queryItem) {
      throw new BadRequestException('this history does not exist');
    }

    return await this.prisma.searchItem.delete({
      where: {
        id,
      },
    });
  }

  async removeAllSearchQueries(userId) {
    if (!userId) {
      throw new UnauthorizedException('authenticate to perform this action');
    }

    return await this.prisma.searchItem.deleteMany({
      where: {
        userId,
      },
    });
  }
}
