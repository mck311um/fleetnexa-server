import { logger } from '../../config/logger';
import { Request, Response } from 'express';
import { adminService } from './admin.service';

const getAdminData = async (req: Request, res: Response) => {
  try {
    const data = await adminService.getAdminData();

    res.status(200).json(data);
  } catch (error) {
    logger.e(error, 'Error fetching admin data');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  getAdminData,
};
