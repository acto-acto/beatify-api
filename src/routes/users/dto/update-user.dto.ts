import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';
import { Playlist } from 'src/types/playlist';
import { Track } from 'src/types/track';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsObject()
  last_player_state?: Partial<{
    playing_track: Track | null;
    playlist: Playlist | null;
    playing_track_index: number;
  }>;
}
