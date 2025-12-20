import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { TransactionController } from './transaction.controller.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TenantRepository } from '../tenant/tenant.repository.js';
import { TenantUserRepository } from '../user/tenant-user/tenant-user.repository.js';
import { TransactionRepository } from './transaction.repository.js';
import { GeneratorModule } from '../../common/generator/generator.module.js';

@Module({
  imports: [PrismaModule, GeneratorModule],
  providers: [
    TransactionService,
    AuthGuard,
    TenantRepository,
    TenantUserRepository,
    TransactionRepository,
  ],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
