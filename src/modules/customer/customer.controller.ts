import { Request, Response } from 'express';
import prisma from '../../config/prisma.config';
import { logger } from '../../config/logger';

const getCustomerViolations = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  try {
    const violations = await prisma.customerViolation.findMany({
      where: { tenantId },
      include: { violation: true },
    });

    return res.status(200).json({ violations });
  } catch (error) {
    logger.e(error, 'Failed to fetch customer violations', { tenantId });
    return res
      .status(500)
      .json({ message: 'Failed to fetch customer violations' });
  }
};

export default {
  getCustomerViolations,
};
