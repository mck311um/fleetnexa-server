import { Module } from "@nestjs/common";
import { TenantBookingController } from "./tenant-booking.controller.js";
import { TenantBookingService } from "./tenant-booking.service.js";
import { AuthGuard } from "../../../common/guards/auth.guard.js";
import { TenantRepository } from "../../../modules/tenant/tenant.repository.js";
import { TenantUserRepository } from "../../../modules/user/tenant-user/tenant-user.repository.js";
import { TenantBookingRepository } from "./tenant-booking.repository.js";
import { VehicleModule } from "../../../modules/vehicle/vehicle.module.js";
import { CustomerModule } from "../../../modules/customer/customer.module.js";
import { TransactionModule } from "../../../modules/transaction/transaction.module.js";
import { VehicleEventModule } from "../../../modules/vehicle/modules/vehicle-event/vehicle-event.module.js";

@Module({
	imports: [
		VehicleModule,
		CustomerModule,
		TransactionModule,
		VehicleEventModule,
	],
	controllers: [TenantBookingController],
	providers: [
		TenantBookingService,
		AuthGuard,
		TenantRepository,
		TenantUserRepository,
		TenantBookingRepository,
	],
	exports: [TenantBookingService],
})
export class TenantBookingModule {}
