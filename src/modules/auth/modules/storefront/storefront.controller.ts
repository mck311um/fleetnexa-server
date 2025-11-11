import { Request, Response } from 'express';
import { storefrontAuthService } from './storefront.service';
import { logger } from '../../../../config/logger';
import {
  LoginDtoSchema,
  ResetPasswordDtoSchema,
  VerifyEmailTokenSchema,
} from '../../auth.dto';

const createUser = async (req: Request, res: Response) => {
  const data = req.body;

  const userDto = await storefrontAuthService.validateUserData(data);

  try {
    const newUser = await storefrontAuthService.createUser(userDto);
    res.status(201).json(newUser);
  } catch (error: any) {
    logger.e(error, 'Error creating storefront user', {
      email: userDto.email,
    });
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const loginUser = async (req: Request, res: Response) => {
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
    const result = await storefrontAuthService.validateUser(userDto);

    res.status(200).json(result);
  } catch (error: any) {
    logger.e(error, 'Error during storefront user login', {
      email: userDto.username,
    });
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const requestPasswordReset = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data.email) {
    logger.w('Email is required for password reset');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await storefrontAuthService.requestPasswordReset(data.email);
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

const verifyPasswordResetToken = async (req: Request, res: Response) => {
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
    await storefrontAuthService.verifyPasswordResetToken(tokenDto);
    res.status(200).json({ message: 'Token verified successfully' });
  } catch (error: any) {
    logger.e(error, 'Error verifying storefront password reset token', {
      email: data.email,
    });
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const resetPassword = async (req: Request, res: Response) => {
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
    await storefrontAuthService.resetPassword(resetDto);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    logger.e(error, 'Error resetting storefront password', {
      email: resetDto.email,
    });
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export default {
  createUser,
  loginUser,
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPassword,
};
