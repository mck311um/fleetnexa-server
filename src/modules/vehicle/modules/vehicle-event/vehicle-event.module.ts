import { Module } from "@nestjs/common";
import { VehicleEventService } from "./vehicle-event.service.js";

@Module({
	imports: [],
	controllers: [],
	providers: [VehicleEventService],
	exports: [VehicleEventService],
})
export class VehicleEventModule {}
