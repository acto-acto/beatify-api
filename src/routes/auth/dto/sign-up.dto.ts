import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  user_name: string;

  @IsNotEmpty()
  full_name: string;

  @MinLength(8)
  password: string;
}
