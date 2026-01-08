import { Module } from "@nestjs/common";
import { TenantActivityController } from "./tenant-activity.controller.js";
import { TenantActivityService } from "./tenant-activity.service.js";
import { TenantRepository } from "../tenant.repository.js";
import { TenantUserRepository } from "../../user/tenant-user/tenant-user.repository.js";

@Module({
	imports: [],
	controllers: [TenantActivityController],
	providers: [TenantActivityService, TenantRepository, TenantUserRepository],
	exports: [TenantActivityService],
})
export class TenantActivityModule {}
