import { Request, Response } from 'express';
import { logger } from '../../config/logger';
import { tenantRepo } from '../../repository/tenant.repository';
import { customerService } from './customer.service';

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

const getCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant } = req.context!;

  try {
    const customer = await customerService.getCustomerById(id, tenant);

    return res.status(200).json(customer);
  } catch (error: any) {
    logger.e(error, 'Failed to get customer by ID', {
      customerId: id,
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res
      .status(500)
      .json({ message: error.message || 'Failed to get customer by ID' });
  }
};

const createCustomer = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  const customerDto = await customerService.validateCustomerData(data);

  try {
    const customer = await customerService.createCustomer(
      customerDto,
      tenant,
      user,
    );

    const customers = await customerService.getTenantCustomers(tenant);

    return res
      .status(201)
      .json({ message: 'Customer created successfully', customer, customers });
  } catch (error: any) {
    logger.e(error, 'Failed to create customer', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res
      .status(500)
      .json({ message: error.message || 'Failed to create customer' });
  }
};

const updateCustomer = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  const customerDto = await customerService.validateCustomerData(data);
  try {
    const customer = await customerService.updateCustomer(
      customerDto,
      tenant,
      user,
    );

    const customers = await customerService.getTenantCustomers(tenant);

    return res.status(200).json({
      message: 'Customer updated successfully',
      customer,
      customers,
    });
  } catch (error: any) {
    logger.e(error, 'Failed to update customer', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      userId: user.id,
    });
    return res
      .status(500)
      .json({ message: error.message || 'Failed to update customer' });
  }
};

const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant, user } = req.context!;

  try {
    await customerService.deleteCustomer(id, tenant, user);

    const customers = await customerService.getTenantCustomers(tenant);

    return res
      .status(200)
      .json({ message: 'Customer deleted successfully', customers });
  } catch (error: any) {
    logger.e(error, 'Failed to delete customer', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      userId: user.id,
    });
    return res
      .status(500)
      .json({ message: error.message || 'Failed to delete customer' });
  }
};

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
