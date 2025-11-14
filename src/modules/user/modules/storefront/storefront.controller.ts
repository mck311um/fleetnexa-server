import { Request, Response } from 'express';
import { storefrontUserService } from './storefront.service';
import { logger } from '../../../../config/logger';

const updateStorefrontUser = async (req: Request, res: Response) => {
  const body = req.body;
  const { storefrontUser } = req.context!;

  const userDto = await storefrontUserService.validateUserData(body);
  try {
    const updatedUser = await storefrontUserService.updateStorefrontUser(
      userDto,
      storefrontUser,
    );

    return res.status(200).json({
      message: 'Account updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    logger.e(error, 'Error updating storefront user', {
      storefrontUserId: storefrontUser.id,
    });
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req: Request, res: Response) => {
  const storefrontUserId = req.storefrontUser?.id;

  if (!storefrontUserId) {
    logger.w('Storefront User ID is missing', { storefrontUserId });
    return res.status(400).json({ error: 'Storefront User ID is required' });
  }

  try {
    const storefrontUser =
      await storefrontUserService.getCurrentUser(storefrontUserId);

    res.status(200).json(storefrontUser);
  } catch (error) {
    logger.e(error, 'Error fetching storefront user', { storefrontUserId });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const changePassword = async (req: Request, res: Response) => {
  const body = req.body;
  const { storefrontUser } = req.context!;

  const userDto = await storefrontUserService.validatePasswordData(body);

  try {
    await storefrontUserService.updatePassword(userDto, storefrontUser);

    res.status(200).json({ message: 'Password Changed Successfully' });
  } catch (error: any) {
    logger.e(error, 'Error updating storefront user password', {
      storefrontUserId: storefrontUser.id,
    });
    res.status(500).json({ message: error.message });
  }
};

const getPreviousBookings = async (req: Request, res: Response) => {
  const { storefrontUser } = req.context!;

  try {
    const bookings =
      await storefrontUserService.getPreviousBookings(storefrontUser);

    res.status(200).json({ bookings });
  } catch (error: any) {
    logger.e(error, 'Error fetching previous bookings', {
      storefrontUserId: storefrontUser.id,
    });
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export default {
  getCurrentUser,
  updateStorefrontUser,
  changePassword,
  getPreviousBookings,
};
