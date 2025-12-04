import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TenantReviewService } from './tenant-review.service.js';
import type { AuthenticatedRequest } from '../../../types/authenticated-request.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';

@Controller('tenant/review')
@UseGuards(AuthGuard)
export class TenantReviewController {
  constructor(private readonly service: TenantReviewService) {}

  @Get()
  async getReviews(@Req() req: AuthenticatedRequest) {
    const { tenant } = req.context;
    return this.service.getTenantReviews(tenant);
  }
}
