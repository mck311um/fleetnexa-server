import { Request, Response } from 'express';
import { userRepo } from '../user/user.repository';
import { logger } from '../../config/logger';

const service = require('./role.service');

const getUserRole = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    logger.w('User ID is missing in request');
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await userRepo.getUserById(userId);

    const role = await service.getRole(user);

    res.status(200).json({ message: 'User role fetched successfully', role });
  } catch (error) {
    logger.e(error, 'Error fetching user role', { userId });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  getUserRole,
};
