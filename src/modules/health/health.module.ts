import { Module } from '@nestjs/common';

import { HealthService } from './health.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [PrismaModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
