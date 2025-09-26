import { Request, Response } from 'express';
import { logger } from '../../../../config/logger';
import { tenantRepo } from '../../../../repository/tenant.repository';
import { tenantLocationService } from './tenant-location.service';
import { TenantLocationSchema } from './tenant-location.dto';
import prisma from '../../../../config/prisma.config';

const initializeTenantLocations = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!id) {
    logger.w('Country ID is missing');
    return res.status(400).json({ message: 'Country ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const country = await prisma.country.findUnique({
      where: { id },
    });

    if (!country) {
      logger.w('Country not found', { countryId: id });
      return res.status(404).json({ message: 'Country not found' });
    }

    if (!req.user) {
      logger.w('User information is missing');
      return res.status(400).json({ message: 'User information is required' });
    }

    const locations = await tenantLocationService.initializeTenantLocations(
      country,
      tenant,
    );

    return res.status(200).json({
      message: 'Tenant locations initialized successfully',
      locations,
    });
  } catch (error) {
    logger.e(error, 'Failed to initialize tenant locations', {
      tenantId,
      tenantCode,
    });
    return res
      .status(500)
      .json({ error: 'Failed to initialize tenant locations' });
  }
};

const getAllLocations = async (req: Request, res: Response) => {
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

    const locations = await tenantLocationService.getAllLocations(tenant);

    return res.status(200).json(locations);
  } catch (error) {
    logger.e(error, 'Failed to get tenant locations', { tenantId });
    return res.status(500).json({ error: 'Failed to get tenant locations' });
  }
};

const addTenantLocation = async (req: Request, res: Response) => {
  const { data } = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Tenant data is missing');
    return res.status(400).json({ message: 'Tenant data is required' });
  }

  const parseResult = TenantLocationSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid user data',
      details: parseResult.error.issues,
    });
  }

  const locationDto = parseResult.data;

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await tenantLocationService.addLocation(locationDto, tenant);

    const locations = await tenantLocationService.getAllLocations(tenant);

    return res
      .status(200)
      .json({ message: 'Location added successfully', locations });
  } catch (error) {
    logger.e(error, 'Failed to add tenant location', { tenantId, tenantCode });
    return res.status(500).json({ error: 'Failed to add tenant location' });
  }
};

const updateTenantLocation = async (req: Request, res: Response) => {
  const { data } = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Tenant data is missing');
    return res.status(400).json({ message: 'Tenant data is required' });
  }

  if (!userId) {
    logger.w('User ID is missing');
    return res.status(400).json({ message: 'User ID is required' });
  }

  const parseResult = TenantLocationSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid user data',
      details: parseResult.error.issues,
    });
  }

  const locationDto = parseResult.data;

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await tenantLocationService.updateLocation(locationDto, tenant, userId);

    const locations = await tenantLocationService.getAllLocations(tenant);

    return res
      .status(200)
      .json({ message: 'Location updated successfully', locations });
  } catch (error) {
    logger.e(error, 'Failed to update tenant location', {
      tenantId,
      tenantCode,
    });
    return res.status(500).json({ error: 'Failed to update tenant location' });
  }
};

const deleteTenantLocation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing');
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  if (!id) {
    logger.w('Location ID is missing');
    return res.status(400).json({ message: 'Location ID is required' });
  }

  if (!userId) {
    logger.w('User ID is missing');
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantCode, tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await tenantLocationService.deleteLocation(id, tenant, userId);

    const locations = await tenantLocationService.getAllLocations(tenant);

    return res
      .status(200)
      .json({ message: 'Location deleted successfully', locations });
  } catch (error) {
    logger.e(error, 'Failed to delete tenant location', {
      tenantId,
      tenantCode,
    });
    return res.status(500).json({ error: 'Failed to delete tenant location' });
  }
};

export default {
  initializeTenantLocations,
  getAllLocations,
  addTenantLocation,
  updateTenantLocation,
  deleteTenantLocation,
};
