import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { TransactionController } from './transaction.controller.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TenantRepository } from '../tenant/tenant.repository.js';
import { TenantUserRepository } from '../user/tenant-user/tenant-user.repository.js';
import { TransactionRepository } from './transaction.repository.js';

@Module({
  imports: [],
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
