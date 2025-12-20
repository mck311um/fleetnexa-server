import { Global, Module } from '@nestjs/common';
import { TenantGateway } from './tenant.gateway.js';

@Global()
@Module({
  providers: [TenantGateway],
  exports: [TenantGateway],
})
export class SocketModule {}
