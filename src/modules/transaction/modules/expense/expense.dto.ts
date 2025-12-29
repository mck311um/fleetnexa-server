import { IsNumber, IsOptional, IsString, IsUUID, Max } from "class-validator";

export class ExpenseDto {
	@IsUUID()
	id: string;

	@IsNumber()
	amount: number;

	@IsString()
	expenseDate: string;

	@IsString()
	expense: string;

	@IsString()
	payee: string;

	@IsString()
	@IsOptional()
	@Max(500)
	notes: string;

	@IsUUID()
	@IsOptional()
	vendorId: string;

	@IsUUID()
	@IsOptional()
	vehicleId: string;

	@IsUUID()
	@IsOptional()
	maintenanceId: string;
}
