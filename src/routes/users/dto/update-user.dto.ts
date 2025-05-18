import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';
import { Playlist } from 'src/types/playlist';
import { Track } from 'src/types/track';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsObject()
  profile?: Partial<{
    userName: string;
    fullName: string;
    avatarUrl: string;
    lastPlayerState: Partial<{
      playingTrack: Track | null;
      playlist: Playlist | null;
      playingTrackIndex: number | null;
      isMinimised: boolean;
      isShuffling: boolean;
      isLooping: 'none' | 'list' | 'single';
      speed: number;
      volume: number;
      trackProgress: number;
    }>;
  }>;
}
