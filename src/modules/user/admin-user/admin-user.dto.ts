import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class AdminUserDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEmail()
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
