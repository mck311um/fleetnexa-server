import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { GeneratorService } from './generator.service.js';

@Module({
  imports: [PrismaModule],
  providers: [GeneratorService],
  exports: [GeneratorService],
})
export class GeneratorModule {}
