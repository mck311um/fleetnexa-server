import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../config/logger';
import { tenantRepo } from '../../../../repository/tenant.repository';
import { tenantLocationService } from './tenant-location.service';

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

export default {
  getAllLocations,
};
