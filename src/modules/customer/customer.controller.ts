import { Request, Response } from 'express';
import prisma from '../../config/prisma.config';
import { logger } from '../../config/logger';
import { CustomerViolationSchema } from './customer.dto';
import { tenantRepo } from '../../repository/tenant.repository';
import service, { customerService } from './customer.service';

const getCustomers = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const customers = await customerService.getTenantCustomers(tenant);

    return res.status(200).json(customers);
  } catch (error) {
    logger.e(error, 'Failed to fetch customers', {
      tenantId,
      tenantCode,
    });
    return res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

const getCustomerViolations = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  try {
    const violations = await prisma.customerViolation.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        violation: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return res.status(200).json({ violations });
  } catch (error) {
    logger.e(error, 'Failed to fetch customer violations', {
      tenantId,
      tenantCode,
    });
    return res
      .status(500)
      .json({ message: 'Failed to fetch customer violations' });
  }
};
const getCustomerViolationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!id) {
    return res
      .status(400)
      .json({ message: 'Customer violation ID is required' });
  }

  try {
    const violations = await prisma.customerViolation.findFirst({
      where: { customerId: id, tenantId, isDeleted: false },
      include: {
        violation: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return res.status(200).json({ violations });
  } catch (error) {
    logger.e(error, 'Failed to fetch customer violation', {
      tenantId,
      tenantCode,
    });
    return res
      .status(500)
      .json({ message: 'Failed to fetch customer violation' });
  }
};
const addCustomerViolation = async (req: Request, res: Response) => {
  const { data } = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Customer violation data is missing', { tenantCode, tenantId });
    return res
      .status(400)
      .json({ message: 'Customer violation data is required' });
  }

  const parseResult = CustomerViolationSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid customer violation data',
      details: parseResult.error.issues,
    });
  }

  const violationDto = parseResult.data;

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await service.addCustomerViolation(violationDto, tenant);

    const violations = await prisma.customerViolation.findMany({
      where: { tenantId },
      include: {
        violation: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return res
      .status(201)
      .json({ message: 'Customer violation added successfully', violations });
  } catch (error) {
    logger.e(error, 'Failed to add customer violation', {
      tenantId,
      tenantCode,
    });
    return res
      .status(500)
      .json({ message: 'Failed to add customer violation' });
  }
};
const updateCustomerViolation = async (req: Request, res: Response) => {
  const { data } = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Customer violation data is missing', { tenantCode, tenantId });
    return res
      .status(400)
      .json({ message: 'Customer violation data is required' });
  }

  const parseResult = CustomerViolationSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid customer violation data',
      details: parseResult.error.issues,
    });
  }

  const violationDto = parseResult.data;

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const violations = await service.updateCustomerViolation(
      violationDto,
      tenant,
    );

    return res
      .status(200)
      .json({ message: 'Customer violation updated successfully', violations });
  } catch (error) {
    logger.e(error, 'Failed to update customer violation', {
      tenantId,
      tenantCode,
    });
    return res
      .status(500)
      .json({ message: 'Failed to update customer violation' });
  }
};
const deleteCustomerViolation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!id) {
    logger.w('Customer violation ID is missing', { tenantCode, tenantId });
    return res
      .status(400)
      .json({ message: 'Customer violation ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const violations = await service.deleteCustomerViolation(id, tenant);

    return res
      .status(200)
      .json({ message: 'Customer violation deleted successfully', violations });
  } catch (error) {
    logger.e(error, 'Failed to delete customer violation', {
      tenantId,
      tenantCode,
    });
    return res
      .status(500)
      .json({ message: 'Failed to delete customer violation' });
  }
};

export default {
  getCustomerViolations,
  getCustomerViolationById,
  addCustomerViolation,
  updateCustomerViolation,
  deleteCustomerViolation,
};
