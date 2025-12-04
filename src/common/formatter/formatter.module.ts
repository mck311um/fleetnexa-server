import { Module } from '@nestjs/common';
import { FormatterService } from './formatter.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [FormatterService],
  exports: [FormatterService],
})
export class FormatterModule {}
