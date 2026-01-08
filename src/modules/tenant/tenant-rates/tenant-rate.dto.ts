import { IsBoolean, IsNumber, IsUUID } from "class-validator";

export class TenantRateDto {
	@IsUUID()
	id: string;

	@IsNumber()
	fromRate: number;

	@IsNumber()
	toRate: number;

	@IsBoolean()
	enabled: boolean;

	@IsUUID()
	currencyId: string;
}
