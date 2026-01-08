import { IsEnum, IsUUID } from "class-validator";
import { RentalAction } from "../../../generated/prisma/enums.js";

export class RentalActivityDto {
	@IsUUID()
	bookingId: string;

	@IsEnum(RentalAction)
	action: RentalAction;
}
