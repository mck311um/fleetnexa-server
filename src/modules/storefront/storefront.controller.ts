import { Request, Response } from 'express';
import { storefrontService } from './storefront.service';
import { logger } from '../../config/logger';

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

export default {
  getTenants,
  getTenantBySlug,
  getVehicles,
  getVehicleById,
};
