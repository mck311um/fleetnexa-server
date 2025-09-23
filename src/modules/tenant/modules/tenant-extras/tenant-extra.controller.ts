import { Request, Response } from 'express';
import { tenantExtraService } from './tenant-extras.service';
import { tenantRepo } from '../../../../repository/tenant.repository';
import { logger } from '../../../../config/logger';

const getTenantExtras = async (req: Request, res: Response) => {
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

    return res.status(200).json(extras);
  } catch (error) {
    logger.e(error, 'Failed to get tenant extras', { tenantId });
    return res.status(500).json({ message: 'Failed to get tenant extras' });
  }
};

export default {
  getTenantExtras,
};
