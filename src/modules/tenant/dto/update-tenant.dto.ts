import {
	IsArray,
	IsEmail,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
	IsUrl,
	IsUUID,
} from "class-validator";

class TenantAddressDto {
	@IsString()
	street: string;

	@IsUUID()
	villageId: string;

	@IsUUID()
	stateId: string;

	@IsUUID()
	countryId: string;
}

class CancellationPolicyDto {
	@IsNumber()
	amount: number;

	@IsString()
	policy: string;

	@IsNumber()
	minimumDays: number;

	@IsNumber()
	bookingMinimumDays: number;
}

class LatePolicyDto {
	@IsNumber()
	amount: number;

	@IsNumber()
	maxHours: number;
}

export class UpdateTenantDto {
	@IsString()
	@IsNotEmpty()
	tenantName: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	number: string;

	@IsString()
	@IsNotEmpty()
	whatsappNumber: string;

	@IsUrl()
	@IsNotEmpty()
	logo: string;

	@IsObject()
	address: TenantAddressDto;

	@IsUrl()
	@IsOptional()
	website?: string;

	@IsString()
	@IsNotEmpty()
	startTime: string;

	@IsString()
	@IsNotEmpty()
	endTime: string;

	@IsArray()
	@IsNotEmpty()
	paymentMethods: string[];

	@IsString()
	@IsNotEmpty()
	financialYearStart: string;

	@IsUUID()
	@IsNotEmpty()
	currencyId: string;

	@IsUUID()
	@IsNotEmpty()
	invoiceSequenceId: string;

	@IsString()
	@IsNotEmpty()
	payableTo: string;

	@IsString()
	@IsOptional()
	invoiceFootNotes?: string;

	@IsNumber()
	@IsNotEmpty()
	fromUSDRate: number;

	@IsNumber()
	@IsNotEmpty()
	securityDeposit: number;

	@IsNumber()
	@IsNotEmpty()
	additionalDriverFee: number;

	@IsNumber()
	@IsNotEmpty()
	daysInMonth: number;

	@IsObject()
	@IsNotEmpty()
	cancellationPolicy: CancellationPolicyDto;

	@IsObject()
	latePolicy: LatePolicyDto;
}
