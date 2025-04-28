import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class AllTracksService {
  private prisma: PrismaClient;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.prisma = new PrismaClient();
  }

  private readonly apiURL = this.configService.get<string>('JAMENDO_API_URL');
  private readonly clientId =
    this.configService.get<string>('JAMENDO_CLIENT_ID');

  async syncTracksWithDatabase(): Promise<void> {
    try {
      const tracksFromApi = await this.fetchTracksFromJamendo();
      const tracks = tracksFromApi.map((track) => ({
        id: track.id,
        name: track.name,
        duration: track.duration,
        audio: track.audio || null,
        image: track.image || null,
        artistId: track.artist_id,
        artistName: track.artist_name,
        albumName: track.album_name || null,
        albumId: track.album_id || null,
      }));

      for (const track of tracks) {
        const { id, ...dataWithoutId } = track;
        await this.prisma.track.upsert({
          where: { id: track.id },
          update: dataWithoutId,
          create: track,
        });
      }

      console.log(`Synced ${tracks.length} tracks to the database`);
    } catch (error) {
      console.error('Error syncing tracks with database:', error);
    }
  }

  async fetchTracksFromJamendo() {
    const response = await lastValueFrom(
      this.httpService
        .get(
          `${this.apiURL}?client_id=${this.clientId}&format=json&limit=200&order=popularity_total`,
        )
        .pipe(map((response) => response.data.results)),
    );
    return response;
  }

  async getAllTracks() {
    return this.prisma.track.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async refreshTracks() {
    await this.syncTracksWithDatabase();
    return { message: 'Tracks refreshed successfully' };
  }
}
