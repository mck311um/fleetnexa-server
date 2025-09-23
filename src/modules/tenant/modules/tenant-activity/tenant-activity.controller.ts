import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../config/logger';
import { tenantRepo } from '../../../../repository/tenant.repository';
import { tenantActivityService } from './tenant-activity.service';

const getTenantActivities = async (req: Request, res: Response) => {
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

    const activities = await tenantActivityService.getTenantActivities(tenant);

    return res.status(200).json(activities);
  } catch (error) {
    logger.e(error, 'Failed to get tenant activities', {
      tenantId,
      tenantCode,
    });
    return res.status(500).json({ message: 'Failed to get tenant activities' });
  }
};

export default {
  getTenantActivities,
};
