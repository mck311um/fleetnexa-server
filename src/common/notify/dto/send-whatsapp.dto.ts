import { IsNotEmpty, IsString } from 'class-validator';

export class SendWhatsAppDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
