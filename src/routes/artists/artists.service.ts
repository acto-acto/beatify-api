import { Injectable } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ArtistsService {
  constructor(private prisma: PrismaService) {}

  create(createArtistDto: CreateArtistDto) {
    return 'This action adds a new artist';
  }

  async findAll(userId?: string) {
    let artists;
    if (!userId) {
      artists = await this.prisma.artist.findMany({
        orderBy: { name: 'asc' },
        include: {
          followers: true,
        },
      });
      return artists.map((artist) => ({
        ...artist,
        isFollowed: false,
        followers: artist.followers.length,
      }));
    } else {
      artists = await this.prisma.artist.findMany({
        orderBy: { name: 'asc' },
        include: {
          followers: {
            where: {
              userId: userId,
            },
            select: {
              userId: true,
            },
          },
        },
      });
      return artists.map((artist) => ({
        ...artist,
        isFollowed: !!artist.followers.some(
          (follower) => follower.userId === userId,
        ),
        followers: artist.followers.length,
      }));
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} artist`;
  }

  update(id: number, updateArtistDto: UpdateArtistDto) {
    return `This action updates a #${id} artist`;
  }

  remove(id: number) {
    return `This action removes a #${id} artist`;
  }
}
