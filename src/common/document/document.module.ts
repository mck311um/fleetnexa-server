import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { GeneratorModule } from '../generator/generator.module.js';
import { FormatterModule } from '../formatter/formatter.module.js';
import { PdfModule } from '../pdf/pdf.module.js';
import { TenantExtrasModule } from '../../modules/tenant/tenant-extra/tenant-extra.module.js';
import { CustomerModule } from '../../modules/customer/customer.module.js';
import { DocumentService } from './document.service.js';

@Module({
  imports: [
    PrismaModule,
    GeneratorModule,
    FormatterModule,
    PdfModule,
    TenantExtrasModule,
    CustomerModule,
  ],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
