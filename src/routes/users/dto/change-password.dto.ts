import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  current_password: string;

  @MinLength(8)
  new_password: string;

  @MinLength(8)
  confirm_new_password: string;
}
