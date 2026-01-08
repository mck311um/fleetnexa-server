import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class PaymentDto {
	@IsUUID()
	id: string;

	@IsNumber()
	@Min(0)
	amount: number;

	@IsString()
	paymentDate: string;

	@IsString()
	notes: string;

	@IsUUID()
	@IsOptional()
	currencyId: string;

	@IsUUID()
	bookingId: string;

	@IsUUID()
	paymentMethodId: string;

	@IsUUID()
	paymentTypeId: string;

	@IsUUID()
	customerId: string;
}
