import { MinLength, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token?: string;

  @MinLength(8)
  newPassword: string;

  @MinLength(8)
  confirmNewPassword: string;
}
