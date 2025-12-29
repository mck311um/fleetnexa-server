import { IsBoolean, IsEmail, IsString } from "class-validator";

export class EmailLoginDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;

	@IsBoolean()
	rememberMe: boolean;
}
