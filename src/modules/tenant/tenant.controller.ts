import { Request, Response } from 'express';
import service, { tenantService } from './tenant.service';
import { logger } from '../../config/logger';
import { CreateTenantSchema } from './dto/create-tenant.dto';
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
import { tenantNotificationService } from './modules/tenant-notification/tenant-notification.service';

const getCurrentTenant = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;

  try {
    const extras = await tenantExtraService.getTenantExtras(tenant.id);
    const locations = await tenantLocationService.getAllLocations(tenant);
    const vehicles = await vehicleService.getTenantVehicles(tenant);
    const customers = await customerService.getTenantCustomers(tenant);
    const bookings = await bookingService.getTenantBookings(tenant);
    const activity = await tenantActivityService.getTenantActivities(tenant);
    const users = await userRepo.getUsers(tenant.id);
    const roles = await userRoleService.getTenantRoles(tenant);
    const violations =
      await tenantViolationsService.getTenantViolations(tenant);
    const currencyRates =
      await tenantCurrencyRatesService.getTenantCurrencyRates(tenant);
    const vendors = await tenantVendorService.getTenantVendors(tenant);
    const scheduledMaintenances =
      await vehicleMaintenanceService.getTenantMaintenanceServices(tenant);
    const notifications = await tenantNotificationService.getNotifications(
      tenant,
      user,
    );

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
      notifications,
    });
  } catch (error: any) {
    logger.e(error, 'Failed to get tenant', {
      tenantCode: tenant.tenantCode,
      tenantId: tenant.id,
    });
    return res
      .status(500)
      .json({ message: error.message || 'Failed to get tenant' });
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

  const tenantDto = await tenantService.validateCreateTenantData(data);
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
  } catch (error: any) {
    logger.e(error, 'Failed to create tenant', {
      email: tenantDto.email,
      tenantName: tenantDto.tenantName,
    });
    return res
      .status(500)
      .json({ message: error.message || 'Failed to create tenant' });
  }
};

const updateTenant = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant } = req.context!;

  if (!data) {
    logger.w('Tenant data is missing', {
      tenantCode: tenant.tenantCode,
      tenantId: tenant.id,
    });
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
    await service.updateTenant(tenantDto, tenant);

    const updatedTenant = await tenantRepo.getTenantById(tenant.id);

    return res.status(200).json({
      message: 'Settings updated successfully',
      tenant: updatedTenant,
    });
  } catch (error) {
    logger.e(error, 'Failed to update tenant', {
      tenantCode: tenant.tenantCode,
      tenantId: tenant.id,
      data,
    });
    return res.status(500).json({ message: 'Failed to update settings' });
  }
};

const updateStorefrontSettings = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  try {
    await tenantService.updateStorefrontSettings(data, tenant, user);
    const updatedTenant = await tenantRepo.getTenantById(tenant.id);
    const vehicles = await vehicleService.getTenantVehicles(tenant);

    return res.status(200).json({
      message: 'Storefront updated successfully',
      tenant: updatedTenant,
      vehicles,
    });
  } catch (error: any) {
    logger.e(error, 'Failed to update storefront settings', {
      tenantCode: tenant.tenantCode,
      tenantId: tenant.id,
      userId: user.id,
      data,
    });
    return res.status(500).json({
      message: error.message || 'Failed to update storefront settings',
    });
  }
};

export default {
  getCurrentTenant,
  getTenantById,
  createTenant,
  updateTenant,
  updateStorefrontSettings,
};
