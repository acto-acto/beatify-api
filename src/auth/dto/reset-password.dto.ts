import { MinLength, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token?: string;

  @MinLength(8)
  new_password: string;

  @MinLength(8)
  confirm_new_password: string;
}
