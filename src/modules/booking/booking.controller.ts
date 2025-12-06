import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service.js';
import type { AuthenticatedRequest } from '../../types/authenticated-request.js';
import { StorefrontGuard } from '../../common/guards/storefront.guard.js';
import { ApiGuard } from '../../common/guards/api.guard.js';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('storefront')
  @UseGuards(StorefrontGuard, ApiGuard)
  async getStorefrontUserBookings(@Req() req: AuthenticatedRequest) {
    const userId = req.storefrontUser!.id;
    return this.bookingService.getStorefrontUserBookings(userId);
  }
}
