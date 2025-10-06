import { Request, Response } from 'express';
import prisma from '../../../config/prisma.config';
import { logger } from '../../../config/logger';

const getCountries = async (req: Request, res: Response) => {
  try {
    const countries = await prisma.country.findMany();

    res.status(200).json(countries);
  } catch (error) {
    logger.e(error, 'Error fetching countries');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const countriesController = {
  getCountries,
};
