import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { lastValueFrom, map } from 'rxjs';
import { Track } from 'src/types/track';

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
      let tracks: Track[] = [];
      for (const track of tracksFromApi) {
        const { id, name, duration, audio, image, releasedate, artist_name } =
          track;

        const artist = await this.prisma.artist.upsert({
          where: { name: artist_name },
          update: {},
          create: { name: artist_name },
        });

        tracks.push({
          id,
          name,
          duration,
          audio: audio || null,
          image: image || null,
          releaseDate: releasedate,
          artistId: artist.id,
        });
      }

      for (const track of tracks) {
        const { id, ...dataWithoutId } = track;
        await this.prisma.track.upsert({
          where: { id: track.id },
          update: dataWithoutId,
          create: track,
        });
      }

      const playlists = [
        'Trending',
        'Top Hits',
        'Todays Picks',
        'New Releases',
        'For You',
      ];
      for (const playlistName of playlists) {
        const randomTracks = tracks
          .sort(() => 0.5 - Math.random())
          .slice(0, 40);

        const playlist = await this.prisma.playlist.findFirst({
          where: { name: playlistName },
        });

        if (playlist) {
          for (const track of randomTracks) {
            await this.prisma.playlistTrack.upsert({
              where: {
                playlistId_trackId: {
                  playlistId: playlist.id,
                  trackId: track.id,
                },
              },
              update: {},
              create: {
                playlistId: playlist.id,
                trackId: track.id,
              },
            });
          }
        } else {
          const playlist = await this.prisma.playlist.create({
            data: { name: playlistName },
          });

          for (const track of randomTracks) {
            await this.prisma.playlistTrack.create({
              data: {
                playlistId: playlist.id,
                trackId: track.id,
              },
            });
          }
        }
      }

      console.log(`Synced ${tracks.length} tracks to the database`);
    } catch (error) {
      console.error('Error syncing tracks with database:', error);
      throw error;
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
