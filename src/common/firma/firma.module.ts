import { Module } from "@nestjs/common";
import { FirmaService } from "./firma.service.js";
import { CustomerModule } from "../../modules/customer/customer.module.js";

@Module({
	imports: [CustomerModule],
	controllers: [],
	providers: [FirmaService],
	exports: [FirmaService],
})
export class FirmaModule {}
