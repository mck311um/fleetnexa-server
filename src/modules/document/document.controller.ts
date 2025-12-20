import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { DocumentService } from './document.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../../types/authenticated-request.js';

@Controller('document')
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(private readonly service: DocumentService) {}

  @Post('invoice/:id')
  async generateBookingInvoice(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const { tenant, user } = req.context;
    return await this.service.generateInvoice(id, tenant, user);
  }

  @Post('agreement/:id')
  async generateBookingAgreement(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const { tenant, user } = req.context;
    return await this.service.generateAgreement(id, tenant, user);
  }

  @Post('agreement/:id/signature')
  async sendAgreementForSignature(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const { tenant, user } = req.context;
    console.log('Sending agreement for signature:', { id });
    return await this.service.sendAgreementForSignature(id, tenant, user);
  }
}
