import { Body, Controller, Post } from '@nestjs/common';
import { StorefrontUserBookingDto } from './dto/storefront-user-booking.dto.js';
import { StorefrontBookingService } from './storefront-booking.service.js';

@Controller('booking/storefront')
export class StorefrontBookingController {
  constructor(private readonly service: StorefrontBookingService) {}

  @Post('user')
  async createUserBooking(@Body('data') data: StorefrontUserBookingDto) {
    return this.service.createUserBooking(data);
  }

  @Post('guest')
  async createGuestBooking() {}
}
