import { Request, Response } from 'express';
import service from './tenant.service';
import { logger } from '../../config/logger';
import { CreateTenantSchema } from './dto/create-tenant.dto';
import prisma from '../../config/prisma.config';
import emailService from '../email/email.service';

const createTenant = async (req: Request, res: Response) => {
  const { data } = req.body;

  if (!data) {
    logger.w('Tenant data is missing');
    return res.status(400).json({ message: 'Tenant data is required' });
  }

  const parseResult = CreateTenantSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid user data',
      details: parseResult.error.issues,
    });
  }

  const tenantDto = parseResult.data;

  try {
    const tenant = await prisma.$transaction(
      async (tx) => {
        const { tenant, user, password } = await service.createTenant(
          tenantDto,
          tx,
        );

        await emailService.sendWelcomeEmail(
          tenant,
          user.username,
          password,
          `${tenantDto.firstName} ${tenantDto.lastName}`,
        );

        return tenant;
      },
      { timeout: 20000 },
    );

    return res.status(201).json({
      message: 'Tenant created successfully',
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      tenantName: tenant.tenantName,
    });
  } catch (error) {
    logger.e(error, 'Failed to create tenant', {
      email: tenantDto.email,
      tenantName: tenantDto.tenantName,
    });
  }
};

export default {
  createTenant,
};
