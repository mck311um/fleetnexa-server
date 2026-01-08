import { Module } from "@nestjs/common";
import { TransactionModule } from "../../transaction.module.js";
import { RefundController } from "./refund.controller.js";
import { RefundService } from "./refund.service.js";
import { AuthGuard } from "../../../../common/guards/auth.guard.js";
import { TenantRepository } from "../../../../modules/tenant/tenant.repository.js";
import { TenantUserRepository } from "../../../../modules/user/tenant-user/tenant-user.repository.js";
import { TenantBookingRepository } from "../../../../modules/booking/tenant-booking/tenant-booking.repository.js";

@Module({
	imports: [TransactionModule],
	controllers: [RefundController],
	providers: [
		RefundService,
		AuthGuard,
		TenantRepository,
		TenantUserRepository,
		TenantBookingRepository,
	],
	exports: [RefundService],
})
export class RefundModule {}
