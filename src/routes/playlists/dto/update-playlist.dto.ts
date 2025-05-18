import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaylistDto } from './create-playlist.dto';
import { IsString } from 'class-validator';

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {
  @IsString()
  trackId?: string;
}
