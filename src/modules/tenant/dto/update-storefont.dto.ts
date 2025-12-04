import { IsBoolean, IsString, ValidateIf } from 'class-validator';

export class UpdateStorefrontDto {
  @IsBoolean()
  storefrontEnabled: boolean;

  @IsString()
  @ValidateIf((o) => o.storefrontEnabled === true)
  description: string;
}
