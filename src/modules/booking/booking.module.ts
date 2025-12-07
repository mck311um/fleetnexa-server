import { Module } from '@nestjs/common';
import { BookingService } from './booking.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { BookingController } from './booking.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [],
  exports: [BookingService],
})
export class BookingModule {}
