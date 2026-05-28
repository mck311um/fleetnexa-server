import { IsString } from 'class-validator';

export class CheckDetailsDto {
  @IsString()
  email: string;

  @IsString()
  phoneNumber: string;
}
