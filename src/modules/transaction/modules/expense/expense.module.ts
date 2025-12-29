import { Module } from "@nestjs/common";
import { ExpenseService } from "./expense.service.js";
import { TransactionModule } from "../../transaction.module.js";
import { ExpenseController } from "./expense.controller.js";
import { AuthGuard } from "../../../../common/guards/auth.guard.js";
import { TenantRepository } from "../../../../modules/tenant/tenant.repository.js";
import { TenantUserRepository } from "../../../../modules/user/tenant-user/tenant-user.repository.js";

@Module({
	imports: [TransactionModule],
	providers: [
		ExpenseService,
		AuthGuard,
		TenantRepository,
		TenantUserRepository,
	],
	controllers: [ExpenseController],
	exports: [ExpenseService],
})
export class ExpenseModule {}
