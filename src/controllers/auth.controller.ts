import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.config';
import { logger } from '../config/logger';

const register = async (req: Request, res: Response) => {
  const { username, password, firstName, lastName, tenantId } = req.body;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        tenantId,
        lastChanged: new Date(),
      },
    });

    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      fullName: `${user.firstName} ${user.lastName}`,
      tenantId: user.tenantId,
      tenant: tenant?.tenantCode,
    };

    const payload = {
      user: {
        id: user.id,
        tenantId: user.tenantId,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    res.status(201).json({ userData, token });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const storefrontRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { account } = req.body;
  try {
    const emailExists = await prisma.storefrontUser.findUnique({
      where: { email: account.email },
    });

    if (emailExists) {
      return res
        .status(400)
        .json({ message: 'Account with this email already exists' });
    }

    const phoneExists = await prisma.storefrontUser.findUnique({
      where: { phone: account.phone },
    });

    if (phoneExists) {
      return res
        .status(400)
        .json({ message: 'Account with this phone number already exists' });
    }

    const licenseExists = await prisma.storefrontUser.findUnique({
      where: { driverLicenseNumber: account.driverLicenseNumber },
    });

    if (licenseExists) {
      return res.status(400).json({
        message: 'Account with this driver license number already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(account.password, salt);

    const user = await prisma.storefrontUser.create({
      data: {
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        phone: account.phone,
        driverLicenseNumber: account.driverLicenseNumber,
        password: hashedPassword,
        dateOfBirth: account.dateOfBirth,
        gender: account.gender,
        licenseExpiry: account.licenseExpiry,
        licenseIssued: account.licenseIssued,
        street: account.street,
        villageId: account.villageId,
        stateId: account.stateId,
        countryId: account.countryId,
        createdAt: new Date(),
      },
      select: {
        password: false,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password, rememberMe } = req.body;

  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        tenant: true,
        role: {
          include: {
            rolePermission: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    logger.i('User login attempt', { username });

    console.log(user);

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      fullName: `${user.firstName} ${user.lastName}`,
      tenantId: user.tenantId,
      tenantCode: user.tenant?.tenantCode,
      roleId: user.roleId,
      requirePasswordChange: user.requirePasswordChange,
    };

    const payload = {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        tenantCode: user.tenant?.tenantCode,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: rememberMe ? '7d' : '30d',
    });

    res.status(200).json({ userData, token });
  } catch (error: any) {
    next(error);
  }
};

const storefrontLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.storefrontUser.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'An account with this email does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Password' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export default { register, login, storefrontRegister, storefrontLogin };
