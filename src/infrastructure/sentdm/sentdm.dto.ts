import { IsString } from 'class-validator';

export class SentDmDto {
  @IsString()
  templateId: string;

  @IsString()
  to: string;

  @IsString()
  profileId: string;
}
