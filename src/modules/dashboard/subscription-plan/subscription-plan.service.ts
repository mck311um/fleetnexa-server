import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { SubscriptionPlanDto } from './subscription-plan.dto.js';

@Injectable()
export class SubscriptionPlanService {
  private readonly logger = new Logger(SubscriptionPlanService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllPlans() {
    try {
      const plans = await this.prisma.subscriptionPlan.findMany();

      return plans;
    } catch (error) {
      this.logger.error('Failed to retrieve plans', error);
      throw error;
    }
  }

  async createPlan(data: SubscriptionPlanDto) {
    try {
      const existingPlanId = await this.prisma.subscriptionPlan.findUnique({
        where: { planId: data.planId },
      });

      if (existingPlanId) {
        this.logger.warn(`Plan with planId ${data.planId} already exists.`);
        throw new Error('Subscription plan with this planId already exists.');
      }

      const existingPlanCode = await this.prisma.subscriptionPlan.findUnique({
        where: { planCode: data.planCode },
      });

      if (existingPlanCode) {
        this.logger.warn(`Plan with planCode ${data.planCode} already exists.`);
        throw new Error('Subscription plan with this planCode already exists.');
      }

      await this.prisma.subscriptionPlan.create({
        data: {
          name: data.name,
          planId: data.planId,
          planCode: data.planCode,
          price: data.price,
          description: data.description,
          categories: {
            connect: data.categories.map((categoryId) => ({ id: categoryId })),
          },
          features: {
            create: data.features.map((feature) => ({
              feature: feature.feature,
            })),
          },
          details: {
            create: {
              users: data.users,
              vehicles: data.vehicles,
            },
          },
        },
      });

      this.logger.log(`Subscription plan ${data.name} created successfully.`);

      const plans = await this.getAllPlans();
      return { message: 'Subscription plan created successfully.', plans };
    } catch (error) {
      this.logger.error('Failed to create subscription plan', error);
      throw error;
    }
  }
}
