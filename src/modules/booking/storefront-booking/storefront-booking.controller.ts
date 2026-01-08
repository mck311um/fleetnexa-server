import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { StorefrontUserBookingDto } from './dto/storefront-user-booking.dto.js';
import { StorefrontBookingService } from './storefront-booking.service.js';
import { StorefrontGuestBookingDto } from './dto/storefront-guest-booking.dto.js';
import { StorefrontGuard } from '../../../common/guards/storefront.guard.js';
import { ApiGuard } from '../../../common/guards/api.guard.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';

@Controller('booking/storefront')
export class StorefrontBookingController {
  constructor(private readonly service: StorefrontBookingService) {}

  @Get('')
  @UseGuards(StorefrontGuard, ApiGuard)
  async getStorefrontUserBookings(@Req() req: AuthenticatedRequest) {
    const userId = req.storefrontUser!.id;
    return this.service.getStorefrontUserBookings(userId);
  }

  @Post('user')
  async createUserBooking(@Body() data: StorefrontUserBookingDto) {
    return this.service.createUserBooking(data);
  }

  @Post('guest')
  async createGuestBooking(@Body() data: StorefrontGuestBookingDto) {
    return this.service.createGuestBooking(data);
  }
}
