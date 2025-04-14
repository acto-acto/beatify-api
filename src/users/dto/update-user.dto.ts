import { IsOptional, IsString } from 'class-validator';
import { Multer } from 'multer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
