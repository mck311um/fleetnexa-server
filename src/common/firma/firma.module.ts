import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { FirmaService } from './firma.service.js';
import { CustomerModule } from '../../modules/customer/customer.module.js';

@Module({
  imports: [PrismaModule, CustomerModule],
  controllers: [],
  providers: [FirmaService],
  exports: [FirmaService],
})
export class FirmaModule {}
