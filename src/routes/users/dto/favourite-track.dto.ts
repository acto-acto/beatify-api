import { IsString } from 'class-validator';

export class FavouriteTrackDto {
  @IsString()
  trackId: string;
}
