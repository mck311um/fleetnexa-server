import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { FirmaService } from './firma.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [FirmaService],
  exports: [FirmaService],
})
export class FirmaModule {}
