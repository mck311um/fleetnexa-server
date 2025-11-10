import { Request, Response } from 'express';
import { logger } from '../../config/logger';
import { authService } from './auth.service';
import {
  LoginDtoSchema,
  ResetPasswordDtoSchema,
  VerifyEmailTokenSchema,
} from './auth.dto';

const adminUserLogin = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    logger.w('Username/password are required');
    return res.status(400).json({ error: 'Username/password are required' });
  }

  const parseResult = LoginDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Username/password validation failed',
      details: parseResult.error.issues,
    });
  }

  const userDto = parseResult.data;

  try {
    const result = await authService.validateAdminUser(userDto);

    if (!result) {
      logger.w('Invalid username or password', { username: userDto.username });
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json(result);
  } catch (error) {
    logger.e(error, 'Error during admin user login', {
      username: userDto.username,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};
const tenantLogin = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    logger.w('Username/password are required');
    return res.status(400).json({ error: 'Username/password are required' });
  }

  const parseResult = LoginDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({});
  }

  const userDto = parseResult.data;

  try {
    const result = await authService.validateTenantUser(userDto);

    if (!result) {
      logger.w('Invalid username or password', {
        username: userDto.username,
      });
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json(result);
  } catch (error) {
    logger.e(error, 'Error during tenant user login', {
      username: userDto.username,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createAdminUser = async (req: Request, res: Response) => {
  const data = req.body;

  const userDto = await authService.validateAdminUserData(data);

  try {
    const newUser = await authService.createAdminUser(userDto);
    res.status(201).json(newUser);
  } catch (error: any) {
    logger.e(error, 'Error creating admin user', {
      username: userDto.username,
    });
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const createStorefrontUser = async (req: Request, res: Response) => {
  const data = req.body;

  const userDto = await authService.validateStorefrontUserData(data);

  try {
    const newUser = await authService.createStorefrontUser(userDto);
    res.status(201).json(newUser);
  } catch (error: any) {
    logger.e(error, 'Error creating storefront user', {
      email: userDto.email,
    });
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const loginStorefrontUser = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    logger.w('Email/password are required');
    return res.status(400).json({ error: 'Email/password are required' });
  }

  const parseResult = LoginDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Email/password validation failed',
      details: parseResult.error.issues,
    });
  }

  const userDto = parseResult.data;

  try {
    const result = await authService.validateStorefrontUser(userDto);

    res.status(200).json(result);
  } catch (error: any) {
    logger.e(error, 'Error during storefront user login', {
      email: userDto.username,
    });
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const requestStorefrontPasswordReset = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data.email) {
    logger.w('Email is required for password reset');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await authService.requestStorefrontPasswordReset(data.email);
    res
      .status(200)
      .json({ message: 'Password reset instructions sent to email' });
  } catch (error) {
    logger.e(error, 'Error requesting storefront password reset', {
      email: data.email,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyStorefrontPasswordResetToken = async (
  req: Request,
  res: Response,
) => {
  const data = req.body;

  if (!data) {
    logger.w('Email and token are required');
    return res.status(400).json({ error: 'Email and token are required' });
  }

  const parseResult = VerifyEmailTokenSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Email/token validation failed',
      details: parseResult.error.issues,
    });
  }

  const tokenDto = parseResult.data;

  try {
    await authService.verifyStorefrontPasswordResetToken(tokenDto);
    res.status(200).json({ message: 'Token verified successfully' });
  } catch (error) {
    logger.e(error, 'Error verifying storefront password reset token', {
      email: data.email,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resetStorefrontPassword = async (req: Request, res: Response) => {
  const data = req.body;

  const parseResult = ResetPasswordDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Password reset validation failed',
      details: parseResult.error.issues,
    });
  }

  const resetDto = parseResult.data;

  try {
    await authService.resetStorefrontPassword(resetDto);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.e(error, 'Error resetting storefront password', {
      email: resetDto.email,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  adminUserLogin,
  tenantLogin,
  createAdminUser,
  createStorefrontUser,
  loginStorefrontUser,
  requestStorefrontPasswordReset,
  verifyStorefrontPasswordResetToken,
  resetStorefrontPassword,
};
