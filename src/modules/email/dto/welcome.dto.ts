import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class WelcomeEmailDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
