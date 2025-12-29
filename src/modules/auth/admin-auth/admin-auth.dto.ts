import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class AdminAuthDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  @Matches(/@devvize\.com$/, {
    message: 'Email is not permitted',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
