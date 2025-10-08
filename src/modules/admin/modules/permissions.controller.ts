import { Request, Response } from 'express';
import prisma from '../../../config/prisma.config';
import { logger } from '../../../config/logger';

const getAppPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.appPermission.findMany();

    res.status(200).json(permissions);
  } catch (error) {
    logger.e(error, 'Error fetching app permissions');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addAppPermission = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    logger.w('No data provided for new app permission');
    return res.status(400).json({ error: 'No data provided' });
  }

  try {
    const newPermission = await prisma.appPermission.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
      },
    });

    const permissions = await prisma.appPermission.findMany();

    res.status(201).json({ newPermission, permissions });
  } catch (error) {
    logger.e(error, 'Error adding app permission');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const permissionsController = {
  getAppPermissions,
  addAppPermission,
};
