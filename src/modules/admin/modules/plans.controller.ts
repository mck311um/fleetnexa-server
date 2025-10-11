import { Request, Response } from 'express';
import prisma from '../../../config/prisma.config';
import { logger } from '../../../config/logger';

const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany();
    res.json(plans);
  } catch (error) {
    logger.e(error, 'Error fetching subscription plans');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const plansController = {
  getPlans,
};
