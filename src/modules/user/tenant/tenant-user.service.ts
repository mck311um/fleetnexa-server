import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TenantUserService {
  private readonly logger = new Logger(TenantUserService.name);
}
