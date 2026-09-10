import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import type { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { Roles } from '../../../modules/auth/decorator/role.decorator';
import { Role } from '../../../shared/enums/role.enum';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';

@Controller('finance/invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TENANT)
  async getInvoices(@Res() res: Response, @Request() req) {
    const { tenant } = req.user;

    const invoices = await this.invoiceService.getInvoices(tenant);

    return res.json(invoices);
  }

  @Get(':accessToken')
  async getInvoiceByToken(
    @Param('accessToken') accessToken: string,
    @Res() res: Response,
  ) {
    const url = await this.invoiceService.getInvoiceByToken(accessToken);

    return res.redirect(url);
  }

  @Post('generate/:bookingId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TENANT)
  async generateInvoice(
    @Param('bookingId') bookingId: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const { tenant } = req.user;
    const user = req.user;

    const data = await this.invoiceService.generateInvoice(
      bookingId,
      tenant,
      user,
      res,
    );

    return res.json(data);
  }
}
