import { Module } from "@nestjs/common";
import { BookingService } from "./booking.service.js";
import { BookingController } from "./booking.controller.js";

@Module({
	imports: [],
	controllers: [BookingController],
	providers: [],
	exports: [BookingService],
})
export class BookingModule {}
