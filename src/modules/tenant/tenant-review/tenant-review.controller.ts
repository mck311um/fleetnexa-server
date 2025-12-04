import { Controller, Get, Req } from '@nestjs/common';
import { TenantReviewService } from './tenant-review.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';

@Controller('tenant/review')
export class TenantReviewController {
  constructor(private readonly service: TenantReviewService) {}

  @Get()
  async getReviews(@Req() req: AuthenticatedRequest) {
    const { tenant } = req.context;
    return this.service.getTenantReviews(tenant);
  }
}
