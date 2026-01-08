import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	ValidateIf,
} from "class-validator";
import { MaintenanceStatus } from "../../../../generated/prisma/enums.js";

export class VehicleMaintenanceDto {
	@IsUUID()
	id: string;

	@IsUUID()
	vehicleId: string;

	@IsArray()
	@IsUUID("all", { each: true })
	@IsNotEmpty()
	services: string[];

	@IsUUID()
	@IsOptional()
	vendorId?: string;

	@IsString()
	startDate: string;

	@IsString()
	endDate: string;

	@IsNumber()
	cost: number;

	@IsEnum(MaintenanceStatus)
	status: MaintenanceStatus;

	@IsBoolean()
	@IsOptional()
	recordExpense?: boolean = false;

	@IsString()
	@IsOptional()
	@ValidateIf((o) => o.recordExpense === true)
	expenseDate?: string;
}
