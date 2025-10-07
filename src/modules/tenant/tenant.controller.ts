import { Request, Response } from 'express';
import service, { tenantService } from './tenant.service';
import { logger } from '../../config/logger';
import { CreateTenantSchema } from './dto/create-tenant.dto';
import prisma from '../../config/prisma.config';
import { UpdateTenantDtoSchema } from './dto/tenant.dto';
import { tenantRepo } from '../../repository/tenant.repository';
import { tenantExtraService } from './modules/tenant-extras/tenant-extras.service';
import { tenantLocationService } from './modules/tenant-location/tenant-location.service';
import { vehicleService } from '../vehicle/vehicle.service';
import { customerService } from '../customer/customer.service';
import { bookingService } from '../booking/booking.service';
import { tenantActivityService } from './modules/tenant-activity/tenant-activity.service';
import { userRepo } from '../user/user.repository';
import { userRoleService } from '../user/modules/user-role/user-role.service';
import { tenantViolationsService } from './modules/tenant-violation/tenant-violation.service';
import { tenantCurrencyRatesService } from './modules/currency-rates/currency-rates.service';
import { emailService } from '../email/email.service';
import { tenantVendorService } from './modules/tenant-vendor/tenant-vendor.service';
import { vehicleMaintenanceService } from '../vehicle/modules/vehicle-maintanance/vehicle-maintenance.service';

const getCurrentTenant = async (req: Request, res: Response) => {
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

    const extras = await tenantExtraService.getTenantExtras(tenantId);
    const locations = await tenantLocationService.getAllLocations(tenant);
    const vehicles = await vehicleService.getTenantVehicles(tenant);
    const customers = await customerService.getTenantCustomers(tenant);
    const bookings = await bookingService.getTenantBookings(tenant);
    const activity = await tenantActivityService.getTenantActivities(tenant);
    const users = await userRepo.getUsers(tenantId);
    const roles = await userRoleService.getTenantRoles(tenant);
    const violations =
      await tenantViolationsService.getTenantViolations(tenant);
    const currencyRates =
      await tenantCurrencyRatesService.getTenantCurrencyRates(tenant);
    const vendors = await tenantVendorService.getTenantVendors(tenant);
    const scheduledMaintenances =
      await vehicleMaintenanceService.getTenantMaintenanceServices(tenant);

    return res.status(200).json({
      tenant,
      extras,
      locations,
      vehicles,
      customers,
      bookings,
      activity,
      scheduledMaintenances,
      users,
      roles,
      violations,
      currencyRates,
      vendors,
    });
  } catch (error) {
    logger.e(error, 'Failed to get tenant', {
      tenantCode,
      tenantId,
    });
    return res.status(500).json({ message: 'Failed to get tenant' });
  }
};
const getTenantById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(id);

    if (!tenant) {
      logger.w('Tenant not found', { id });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    return res.status(200).json(tenant);
  } catch (error) {
    logger.e(error, 'Failed to get tenant', { id });
    return res.status(500).json({ message: 'Failed to get tenant' });
  }
};

const createTenant = async (req: Request, res: Response) => {
  const data = req.body;

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
    const { tenant, token } = await tenantService.createTenant(tenantDto);

    if (typeof token !== 'string') {
      await emailService.sendBusinessVerificationEmail(tenant, token);
    }

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
    return res.status(500).json({ message: 'Failed to create tenant' });
  }
};

const updateTenant = async (req: Request, res: Response) => {
  const data = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Tenant data is missing', { tenantCode, tenantId });
    return res.status(400).json({ message: 'Tenant data is required' });
  }

  const parseResult = UpdateTenantDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid tenant data',
      details: parseResult.error.issues,
    });
  }

  const tenantDto = parseResult.data;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await service.updateTenant(tenantDto, tenant);

    const updatedTenant = await tenantRepo.getTenantById(tenantId);

    return res.status(200).json({
      message: 'Settings updated successfully',
      tenant: updatedTenant,
    });
  } catch (error) {
    logger.e(error, 'Failed to update tenant', {
      tenantCode,
      tenantId,
      data,
    });
    return res.status(500).json({ message: 'Failed to update settings' });
  }
};

export default {
  getCurrentTenant,
  getTenantById,
  createTenant,
  updateTenant,
};
