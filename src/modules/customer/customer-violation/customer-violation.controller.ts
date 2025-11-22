import { Request, Response } from 'express';
import prisma from '../../../config/prisma.config';
import { logger } from '../../../config/logger';
import { customerViolationService } from './customer-violation.service';
import { customerRepo } from '../customer.repository';

const getCustomerViolations = async (req: Request, res: Response) => {
  const { tenant } = req.context!;

  try {
    const violations =
      await customerViolationService.getCustomerViolations(tenant);

    return res.status(200).json({ violations });
  } catch (error) {
    logger.e(error, 'Failed to fetch customer violations', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res
      .status(500)
      .json({ message: 'Failed to fetch customer violations' });
  }
};

const getCustomerViolationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant } = req.context!;

  if (!id) {
    return res
      .status(400)
      .json({ message: 'Customer violation ID is required' });
  }

  try {
    const violation = await customerViolationService.getCustomerViolationById(
      id,
      tenant,
    );

    return res.status(200).json({ violation });
  } catch (error: any) {
    logger.e(error, 'Failed to fetch customer violation', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res
      .status(500)
      .json({ message: error.message || 'Failed to fetch customer violation' });
  }
};

const addCustomerViolation = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant } = req.context!;

  const violationDto =
    await customerViolationService.validateCustomerViolationData(data);

  try {
    await customerViolationService.addCustomerViolation(violationDto, tenant);

    const violations = await prisma.customerViolation.findMany({
      where: { tenantId: tenant.id, isDeleted: false },
      include: {
        violation: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const customer = await customerRepo.getCustomerById(
      violationDto.customerId,
      tenant.id,
    );

    return res.status(201).json({
      message: 'Customer violation added successfully',
      violations,
      customer,
    });
  } catch (error: any) {
    logger.e(error, 'Failed to add customer violation', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res
      .status(500)
      .json({ message: error.message || 'Failed to add customer violation' });
  }
};

const updateCustomerViolation = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant } = req.context!;

  const violationDto =
    await customerViolationService.validateCustomerViolationData(data);

  try {
    const violations = await customerViolationService.updateCustomerViolation(
      violationDto,
      tenant,
    );

    const customer = await customerRepo.getCustomerById(
      violationDto.customerId,
      tenant.id,
    );

    return res.status(200).json({
      message: 'Customer violation updated successfully',
      violations,
      customer,
    });
  } catch (error: any) {
    logger.e(error, 'Failed to update customer violation', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(500).json({
      message: error.message || 'Failed to update customer violation',
    });
  }
};
const deleteCustomerViolation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant } = req.context!;

  if (!id) {
    logger.w('Customer violation ID is missing', {
      tenantCode: tenant.tenantCode,
      tenantId: tenant.id,
    });
    return res
      .status(400)
      .json({ message: 'Customer violation ID is required' });
  }

  try {
    const violations = await customerViolationService.deleteCustomerViolation(
      id,
      tenant,
    );

    return res
      .status(200)
      .json({ message: 'Customer violation deleted successfully', violations });
  } catch (error: any) {
    logger.e(error, 'Failed to delete customer violation', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res
      .status(500)
      .json({
        message: error.message || 'Failed to delete customer violation',
      });
  }
};

export default {
  getCustomerViolations,
  getCustomerViolationById,
  addCustomerViolation,
  updateCustomerViolation,
  deleteCustomerViolation,
};
