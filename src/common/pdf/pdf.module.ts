import { Module } from "@nestjs/common";
import { PdfService } from "./pdf.service.js";
import { AwsModule } from "../aws/aws.module.js";

@Module({
	imports: [AwsModule],
	providers: [PdfService],
	exports: [PdfService],
})
export class PdfModule {}
