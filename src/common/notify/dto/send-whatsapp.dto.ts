import {
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
} from "class-validator";

export class DocumentDto {
	@IsUrl()
	@IsNotEmpty()
	url: string;

	@IsString()
	@IsNotEmpty()
	fileName: string;
}

export class SendWhatsAppDto {
	@IsString()
	@IsNotEmpty()
	recipient: string;

	@IsString()
	@IsNotEmpty()
	message: string;

	@IsArray()
	@IsOptional()
	documents?: DocumentDto[];
}
