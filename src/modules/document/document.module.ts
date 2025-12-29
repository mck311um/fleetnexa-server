import { Global, Module } from "@nestjs/common";
import { PdfModule } from "../../common/pdf/pdf.module.js";
import { TenantExtrasModule } from "../tenant/tenant-extra/tenant-extra.module.js";
import { CustomerModule } from "../customer/customer.module.js";
import { DocumentService } from "./document.service.js";
import { AuthGuard } from "../../common/guards/auth.guard.js";
import { TenantRepository } from "../tenant/tenant.repository.js";
import { TenantUserRepository } from "../user/tenant-user/tenant-user.repository.js";
import { DocumentController } from "./document.controller.js";
import { FirmaModule } from "../../common/firma/firma.module.js";

@Global()
@Module({
	imports: [PdfModule, TenantExtrasModule, CustomerModule, FirmaModule],
	controllers: [DocumentController],
	providers: [
		DocumentService,
		AuthGuard,
		TenantRepository,
		TenantUserRepository,
	],
	exports: [DocumentService],
})
export class DocumentModule {}
