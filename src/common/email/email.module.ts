import { Global, Module } from "@nestjs/common";
import { EmailService } from "./email.service.js";
import { NotifyModule } from "../notify/notify.module.js";
import { CustomerModule } from "../../modules/customer/customer.module.js";

@Global()
@Module({
	imports: [NotifyModule, CustomerModule],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
