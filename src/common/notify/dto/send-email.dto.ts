import {
	IsArray,
	IsEmail,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
} from "class-validator";

export class SendEmailDto {
	@IsArray()
	@IsEmail({}, { each: true })
	recipients: string[];

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	cc: string[];

	@IsString()
	@IsNotEmpty()
	templateName: string;

	@IsObject()
	templateData: Record<string, any>;

	@IsEmail()
	@IsNotEmpty()
	sender: string;

	@IsString()
	@IsNotEmpty()
	senderName: string;
}
