import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  fullName: string;

  @MinLength(8)
  password: string;
}
