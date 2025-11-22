import { Request, Response } from 'express';
import { storefrontService } from './storefront.service';
import { logger } from '../../config/logger';
import { StorefrontRatingSchema } from './storefront.dto';
import { tenantRepo } from '../../repository/tenant.repository';

const getTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await storefrontService.getTenants();

    res.status(200).json({ tenants });
  } catch (error) {
    logger.e(error, 'Error fetching tenants for storefront');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTenantBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const tenant = await storefrontService.getTenantBySlug(slug);

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.status(200).json(tenant);
  } catch (error) {
    logger.e(error, `Error fetching tenant with slug: ${slug}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await storefrontService.getVehicles();

    res.status(200).json(vehicles);
  } catch (error) {
    logger.e(error, 'Error fetching vehicles for storefront');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const vehicle = await storefrontService.getVehicleById(id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    logger.e(error, `Error fetching vehicle with id: ${id}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const rateTenant = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    logger.e('No data provided for rating tenant');
    return res.status(400).json({ error: 'Bad Request: No data provided' });
  }

  const parseResult = StorefrontRatingSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid rating data',
      details: parseResult.error.issues,
    });
  }

  const ratingDto = parseResult.data;

  try {
    const tenant = await tenantRepo.getTenantById(ratingDto.tenantId || '');

    if (!tenant) {
      logger.e(`Tenant not found with id: ${ratingDto.tenantId}`);
      return res.status(404).json({ error: 'Tenant not found' });
    }

    await storefrontService.rateTenant(ratingDto, tenant);
    res.status(201).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    logger.e(error, 'Error saving tenant rating');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const rateSite = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    logger.e('No data provided for site rating');
    return res.status(400).json({ error: 'Bad Request: No data provided' });
  }

  const parseResult = StorefrontRatingSchema.omit({ tenantId: true }).safeParse(
    data,
  );
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid site rating data',
      details: parseResult.error.issues,
    });
  }

  const ratingDto = parseResult.data;

  try {
    await storefrontService.rateRentnexa(ratingDto);
    res.status(201).json({ message: 'Site rating submitted successfully' });
  } catch (error) {
    logger.e(error, 'Error saving site rating');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default {
  getTenants,
  getTenantBySlug,
  getVehicles,
  getVehicleById,
  rateTenant,
  rateSite,
};
