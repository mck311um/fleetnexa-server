import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class RefundDto {
	@IsUUID()
	id: string;

	@IsNumber()
	@Min(0)
	amount: number;

	@IsString()
	refundDate: string;

	@IsString()
	@IsOptional()
	reason?: string;

	@IsUUID()
	bookingId: string;

	@IsUUID()
	customerId: string;
}
