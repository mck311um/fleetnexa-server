import { Module } from '@nestjs/common';
import { TenantGateway } from './tenant.gateway.js';

@Module({
  providers: [TenantGateway],
  exports: [TenantGateway],
})
export class SocketModule {}
