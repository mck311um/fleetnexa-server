import e, { Request, Response } from 'express';
import { logger } from '../../../../config/logger';
import { tenantRepo } from '../../../../repository/tenant.repository';
import { tenantViolationsService } from './tenant-violation.service';
import { TenantViolationSchema } from './tenant-violation.dto';
import prisma from '../../../../config/prisma.config';

const getAllTenantViolations = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const violations =
      await tenantViolationsService.getTenantViolations(tenant);

    return res.status(200).json(violations);
  } catch (error) {
    logger.e(error, 'Failed to get tenant violations', {
      tenantId,
      tenantCode,
    });
    return res.status(500).json({ error: 'Failed to get tenant violations' });
  }
};

const createViolation = async (req: Request, res: Response) => {
  const data = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Violation data is missing', { tenantCode, tenantId });
    return res.status(400).json({ message: 'Violation data is required' });
  }

  const parseResult = TenantViolationSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid user data',
      details: parseResult.error.issues,
    });
  }

  const violationDto = parseResult.data;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const violations = await tenantViolationsService.createViolation(
      violationDto,
      tenant,
    );

    logger.i('Violation(s) created successfully', { violations });

    return res
      .status(201)
      .json({ message: 'Violation created successfully', violations });
  } catch (error) {
    logger.e(error, 'Failed to create violation', {
      tenantCode,
      tenantId,
      violation: data.violation,
    });
    return res.status(500).json({ message: 'Failed to create violation' });
  }
};

const updateViolation = async (req: Request, res: Response) => {
  const data = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Violation data is missing', { tenantCode, tenantId });
    return res.status(400).json({ message: 'Violation data is required' });
  }

  const parseResult = TenantViolationSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid user data',
      details: parseResult.error.issues,
    });
  }

  const violationDto = parseResult.data;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const violations = await tenantViolationsService.updateViolation(
      violationDto,
      tenant,
    );

    return res
      .status(200)
      .json({ message: 'Violation updated successfully', violations });
  } catch (error) {
    logger.e(error, 'Failed to update violation', {
      tenantCode,
      tenantId,
      violation: data.violation,
    });
    return res.status(500).json({ message: 'Failed to update violation' });
  }
};

const deleteViolation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!id) {
    logger.w('Violation ID is missing', { tenantCode, tenantId });
    return res.status(400).json({ message: 'Violation ID is required' });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const violations = await tenantViolationsService.deleteViolation(
      id,
      tenant,
    );

    return res
      .status(200)
      .json({ message: 'Violation deleted successfully', violations });
  } catch (error) {
    logger.e(error, 'Failed to delete violation', {
      tenantCode,
      tenantId,
      violationId: id,
    });
    return res.status(500).json({ message: 'Failed to delete violation' });
  }
};

export default {
  getAllTenantViolations,
  createViolation,
  updateViolation,
  deleteViolation,
};
