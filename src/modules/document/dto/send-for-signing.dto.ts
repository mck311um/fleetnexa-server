import { IsEmail, IsUUID } from "class-validator";

export class SendForSigningDto {
	@IsUUID()
	bookingId: string;

	@IsEmail()
	recipient: string;

	@IsEmail()
	representative: string;
}
