import { Module } from '@nestjs/common';
import { BookingService } from './booking.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { BookingRepository } from './booking.repository.js';

@Module({
  imports: [PrismaModule],
  providers: [BookingService, BookingRepository],
  exports: [BookingService],
})
export class BookingModule {}
