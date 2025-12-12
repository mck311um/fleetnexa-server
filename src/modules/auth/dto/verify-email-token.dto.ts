import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export class VerifyEmailTokenDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
