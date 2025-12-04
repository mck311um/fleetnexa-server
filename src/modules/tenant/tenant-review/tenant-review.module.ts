import { Module } from '@nestjs/common';
import { TenantReviewService } from './tenant-review.service.js';
import { TenantReviewController } from './tenant-review.controller.js';

@Module({
  imports: [],
  providers: [TenantReviewService],
  controllers: [TenantReviewController],
  exports: [TenantReviewService],
})
export class TenantReviewModule {}
