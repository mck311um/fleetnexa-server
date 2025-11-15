import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TenantAuthService {
  private readonly logger = new Logger(TenantAuthService.name);
}
