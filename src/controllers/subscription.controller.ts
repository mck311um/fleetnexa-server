import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma.config';

const addFeatures = async (req: Request, res: Response, next: NextFunction) => {
  const { plan } = req.body;
  const { planName } = req.body;

  if (!planName) {
    return res.status(400).json({ error: 'Plan name is required' });
  }

  if (!plan || plan.length === 0) {
    return res.status(400).json({ error: 'Features are required' });
  }

  try {
    const planRecord = await prisma.subscriptionPlan.findUnique({
      where: { name: planName },
    });

    if (!planRecord) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const planId = planRecord.id;

    await prisma.$transaction(async (tx) => {
      await tx.planFeatures.deleteMany({
        where: {
          planId: planId,
        },
      });

      await tx.planFeatures.createMany({
        data: plan.map((feature: string) => ({
          feature,
          planId,
        })),
      });
    });

    return res.status(201).json({ message: 'Features updated successfully' });
  } catch (error) {
    next(error);
  }
};

const addFeaturesBulk = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { plans } = req.body;

  if (!plans || !Array.isArray(plans) || plans.length === 0) {
    return res.status(400).json({ error: 'Plans are required' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const { planName, plan } of plans) {
        const planRecord = await tx.subscriptionPlan.findUnique({
          where: { name: planName },
        });
        if (!planRecord) continue;

        const planId = planRecord.id;

        await tx.planFeatures.deleteMany({ where: { planId } });

        await tx.planFeatures.createMany({
          data: plan.map((feature: string) => ({
            feature,
            planId,
          })),
        });
      }
    });

    return res
      .status(201)
      .json({ message: 'All plan features updated successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  addFeatures,
  addFeaturesBulk,
};
