import { Request, Response } from 'express';
import { tenantUserService } from './tenant-user.service';
import { logger } from '../../../../config/logger';

const requestPassword = async (req: Request, res: Response) => {
  const data = req.body;

  const userDto = await tenantUserService.validatePasswordRequestData(data);

  try {
    await tenantUserService.sendPasswordResetEmail(userDto);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error: any) {
    logger.e(error, 'Error requesting tenant user password reset', {
      username: userDto.username,
    });
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const verifyEmailToken = async (req: Request, res: Response) => {
  const data = req.body;

  const userDto = await tenantUserService.validateVerifyEmailData(data);

  try {
    await tenantUserService.verifyEmailToken(userDto);
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error: any) {
    logger.e(error, 'Error verifying tenant user email token', {
      email: userDto.email,
    });
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const changePassword = async (req: Request, res: Response) => {
  const data = req.body;

  const userDto = await tenantUserService.validateChangePasswordData(data);

  try {
    await tenantUserService.changePassword(userDto);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    logger.e(error, 'Error changing tenant user password', {
      email: userDto.email,
    });
    res.status(500).json({ message: error.message });
  }
};

export default {
  requestPassword,
  verifyEmailToken,
  changePassword,
};
