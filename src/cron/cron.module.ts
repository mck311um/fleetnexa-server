import { Module } from "@nestjs/common";
import { CronService } from "./cron.service.js";

@Module({
	imports: [],
	providers: [CronService],
	exports: [CronService],
})
export class CronModule {}
