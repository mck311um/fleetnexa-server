import { Module } from '@nestjs/common';
import { SubscriptionPlanController } from './subscription-plan.controller.js';
import { SubscriptionPlanService } from './subscription-plan.service.js';

@Module({
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
