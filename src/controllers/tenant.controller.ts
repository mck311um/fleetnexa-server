import { NextFunction, Request, Response } from 'express';
import { tenantRepo } from '../repository/tenant.repository';
import prisma from '../config/prisma.config';
import crypto from 'crypto';
import loggerConfig from '../config/logger.config';
import generator from '../services/generator.service';
import bcrypt from 'bcrypt';
import emailService from '../services/ses.service';
import { WelcomeEmailParams } from '../types/email';
import { logger } from '../config/logger';

const getTenantById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  try {
    const tenant = await tenantRepo.getTenantById(id);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (error: any) {
    next(error);
  }
};
const getTenantExtras = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tenantId = req.user?.tenantId;
  try {
    const [tenantServices, tenantEquipments, tenantInsurances] =
      await Promise.all([
        prisma.tenantService.findMany({
          where: { tenantId: tenantId, isDeleted: false },
          include: { service: true },
        }),
        prisma.tenantEquipment.findMany({
          where: { tenantId: tenantId, isDeleted: false },
          include: { equipment: true },
        }),
        prisma.tenantInsurance.findMany({
          where: { tenantId: tenantId, isDeleted: false },
        }),
      ]);

    const combined: any[] = [
      ...tenantServices.map((item) => ({
        ...item,
        type: 'Service',
        name: item.service.service,
        icon: item.service.icon,
        description: item.service.description,
      })),
      ...tenantInsurances.map((item) => ({
        ...item,
        type: 'Insurance',
        name: item.insurance,
        icon: 'FaShieldAlt',
        description: item.description,
      })),
      ...tenantEquipments.map((item) => ({
        ...item,
        type: 'Equipment',
        name: item.equipment.equipment,
        icon: item.equipment.icon,
        description: item.equipment.description,
      })),
    ];

    res.status(200).json(combined);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
const getTenantRentalActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tenantId = req.user?.tenantId;
  try {
    const rentalActivity = await prisma.rentalActivity.findMany({
      where: { tenantId: tenantId },
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true,
          },
        },
        customer: true,
      },
    });

    res.status(200).json(rentalActivity);
  } catch (error) {
    next(error);
  }
};
const createTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tenantName, email, number, firstName, lastName } = req.body;

  try {
    const success = await prisma.$transaction(async (tx: any) => {
      const tenantCode = await generator.generateTenantCode(tenantName);
      const slug = await generator.generateTenantSlug(tenantName);

      const newTenant = await tx.tenant.create({
        data: {
          tenantCode,
          tenantName,
          slug,
          email,
          number,
          logo: 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/placeholder_tenant.jpg',
        },
      });

      const userRole = await tx.userRole.create({
        data: {
          name: 'Admin',
          description: 'Default role for new tenants',
          show: true,
          tenant: { connect: { id: newTenant.id } },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const superAdminRole = await tx.userRole.create({
        data: {
          name: 'Super Admin',
          description: 'Super Admin role for new tenants',
          show: false,
          tenant: { connect: { id: newTenant.id } },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const permissions = await tx.appPermission.findMany({});

      await tx.userRolePermission.createMany({
        data: permissions.map((perm: any) => ({
          roleId: userRole.id,
          permissionId: perm.id,
          assignedAt: new Date(),
        })),
      });

      await tx.userRolePermission.createMany({
        data: permissions.map((perm: any) => ({
          roleId: superAdminRole.id,
          permissionId: perm.id,
          assignedAt: new Date(),
        })),
      });

      const salt = await bcrypt.genSalt(10);
      const password = await generator.generateTempPassword(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      const username = await generator.generateUserName(firstName, lastName);

      const superAdminPassword = await generator.generateTempPassword(12);
      const superAdminHashedPassword = await bcrypt.hash(
        superAdminPassword,
        salt,
      );

      const user = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          firstName,
          lastName,
          tenantId: newTenant.id,
          lastChanged: new Date(),
          roleId: userRole.id,
        },
      });

      await tx.user.create({
        data: {
          username: `admin_${tenantCode.toLowerCase()}`,
          password: superAdminHashedPassword,
          firstName,
          lastName,
          tenantId: newTenant.id,
          lastChanged: new Date(),
          roleId: superAdminRole.id,
          requiredPasswordChange: false,
        },
      });

      return { user, tenant: newTenant, password };
    });

    const templateData: WelcomeEmailParams = {
      name: success.user.firstName + ' ' + success.user.lastName,
      tenantName: success.tenant.tenantName,
      username: success.user.username,
      password: success.password,
    };

    await emailService.sendEmail({
      to: [success.tenant.email],
      template: 'WelcomeTemplate',
      templateData,
    });

    res.status(201).json();
  } catch (error: any) {
    next(error);
  }
};
const updateTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = req.body;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      await prisma.address.upsert({
        where: { tenantId: tenantId },
        update: {
          street: body.address.street,
          zipCode: body.address.zipCode.toString(),
          village: { connect: { id: body.address.villageId } },
          state: { connect: { id: body.address.stateId } },
          country: { connect: { id: body.address.countryId } },
        },
        create: {
          tenant: { connect: { id: tenantId } },
          street: body.address.street,
          zipCode: body.address.zipCode.toString(),
          village: { connect: { id: body.address.villageId } },
          state: { connect: { id: body.address.stateId } },
          country: { connect: { id: body.address.countryId } },
        },
      });

      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          currencyId: body.currencyId,
          email: body.email,
          invoiceFootNotes: body.invoiceFootNotes,
          invoiceSequenceId: body.invoiceSequenceId,
          logo: body.logo,
          number: body.number,
          tenantName: body.tenantName,
          financialYearStart: body.financialYearStart,
          setupCompleted: true,
          securityDeposit: body.securityDeposit,
          additionalDriverFee: body.additionalDriverFee,
          daysInMonth: body.daysInMonth,
          description: body.description,
          paymentMethods: {
            set: body.paymentMethods.map((method: any) => ({ id: method.id })),
          },
        },
      });

      await tx.cancellationPolicy.upsert({
        where: {
          tenantId: tenantId,
        },
        update: {
          amount: parseInt(body.cancellationPolicy?.amount) || 0,
          policy: body.cancellationPolicy?.policy || 'fixed_amount',
          minimumDays: parseInt(body.cancellationPolicy?.minimumDays) || 0,
        },
        create: {
          tenantId: tenantId!,
          tenant: { connect: { id: tenantId } },
          amount: parseInt(body.cancellationPolicy?.amount) || 0,
          policy: body.cancellationPolicy?.policy || 'fixed_amount',
          minimumDays: parseInt(body.cancellationPolicy?.minimumDays) || 0,
          bookingMinimumDays:
            parseInt(body.cancellationPolicy?.bookingMinimumDays) || 0,
        },
      });

      await tx.latePolicy.upsert({
        where: {
          tenantId: tenantId,
        },
        update: {
          amount: body.latePolicy?.amount || 0,
          maxHours: body.latePolicy?.maxHours || 0,
        },
        create: {
          tenantId: tenantId!,
          tenant: { connect: { id: tenantId } },
          amount: body.latePolicy?.amount || 0,
          maxHours: body.latePolicy?.maxHours || 0,
        },
      });

      const currencyRates = await tx.tenantCurrencyRate.findMany({
        where: { tenantId: tenantId },
      });

      if (currencyRates.length <= 0) {
        const currencies = await tx.currency.findMany({});

        for (const currency of currencies) {
          if (currency.id === body.currencyId) {
            await tx.tenantCurrencyRate.create({
              data: {
                id: crypto.randomUUID(),
                tenantId: tenantId!,
                currencyId: currency.id,
                enabled: true,
                fromRate: 1,
                toRate: 1,
                createdAt: new Date(),
              },
            });
          } else {
            await tx.tenantCurrencyRate.create({
              data: {
                id: crypto.randomUUID(),
                tenantId: tenantId!,
                currencyId: currency.id,
                enabled: false,
                fromRate: 0.0,
                toRate: 0.0,
                createdAt: new Date(),
              },
            });
          }
        }
      }
    });

    const tenant = await tenantRepo.getTenantById(tenantId!);
    res.json(tenant);
  } catch (error: any) {
    next(error);
  }
};

// #region Tenant Location
const initializeTenantLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { country } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      console.log('Initializing tenant locations for country:', country);

      const presetLocations = await tx.presetLocation.findMany({
        where: { countryId: country },
      });

      await tx.tenantLocation.create({
        data: {
          id: crypto.randomUUID(),
          location: 'Main Office',
          tenantId: tenantId!,
          pickupEnabled: true,
          returnEnabled: true,
          deliveryFee: 0,
          collectionFee: 0,
          minimumRentalPeriod: 1,
          updatedAt: new Date(),
          updatedBy: userId,
          isDeleted: false,
        },
      });

      for (const location of presetLocations) {
        await tx.tenantLocation.create({
          data: {
            id: crypto.randomUUID(),
            location: location.location,
            tenantId: tenantId!,
            pickupEnabled: true,
            returnEnabled: true,
            deliveryFee: 0,
            collectionFee: 0,
            minimumRentalPeriod: 1,
            updatedAt: new Date(),
            updatedBy: userId,
            isDeleted: false,
          },
        });
      }
    });

    const tenantLocations = await prisma.tenantLocation.findMany({
      where: { tenantId: tenantId },
    });

    res.status(201).json(tenantLocations);
  } catch (error) {
    next(error);
  }
};
const getTenantLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tenantId = req.user?.tenantId;

  try {
    const tenantLocations = await prisma.tenantLocation.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        vehicles: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    res.json(tenantLocations);
  } catch (error: any) {
    next(error);
  }
};
const createTenantLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { location } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantLocation.create({
      data: {
        id: location.id,
        location: location.location,
        tenantId: tenantId ?? '',
        pickupEnabled: location.pickupEnabled ?? false,
        returnEnabled: location.returnEnabled ?? false,
        storefrontEnabled: location.storefrontEnabled ?? false,
        deliveryFee: location.deliveryFee ?? 0,
        collectionFee: location.collectionFee ?? 0,
        minimumRentalPeriod: location.minimumRentalPeriod ?? 0,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantLocations = await prisma.tenantLocation.findMany({
      where: { tenantId: tenantId },
    });

    res.status(201).json({ ...tenantLocations });
  } catch (error: any) {
    console.error(error);
    next(error);
  }
};
const updateTenantLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { location } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    loggerConfig.logger.info(location.storefrontEnabled);
    await prisma.tenantLocation.update({
      where: { id: location.id },
      data: {
        location: location.location,
        tenantId: tenantId ?? '',
        pickupEnabled: location.pickupEnabled ?? false,
        returnEnabled: location.returnEnabled ?? false,
        storefrontEnabled: location.storefrontEnabled,
        deliveryFee: location.deliveryFee ?? 0,
        collectionFee: location.collectionFee ?? 0,
        minimumRentalPeriod: location.minimumRentalPeriod ?? 0,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantLocations = await prisma.tenantLocation.findMany({
      where: { tenantId: tenantId },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });

    res.status(201).json(tenantLocations);
  } catch (error: any) {
    next(error);
  }
};
const deleteTenantLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantLocation.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantLocations = await prisma.tenantLocation.findMany({
      where: { tenantId: tenantId, isDeleted: false },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });

    res.status(200).json(tenantLocations);
  } catch (error: any) {
    console.error(error);
    next(error);
  }
};
// #endregion

// #region Tenant Services
const getServices = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  try {
    const tenantServices = await prisma.tenantService.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        service: true,
      },
    });

    res.status(200).json(tenantServices);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tenant services' });
  }
};
const addService = async (req: Request, res: Response) => {
  const { service } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.tenantService.create({
      data: {
        id: service.id,
        serviceId: service.serviceId,
        tenantId: tenantId!,
        pricePolicy: service.pricePolicy,
        price: service.price,
        isActive: service.isActive ?? true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantServices = await prisma.tenantService.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json({ ...tenantServices });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error Adding Service' });
  }
};
const updateService = async (req: Request, res: Response) => {
  const { service } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantService.update({
      where: { id: service.id },
      data: {
        price: service.price,
        pricePolicy: service.pricePolicy,
        isActive: service.isActive ?? true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantServices = await prisma.tenantService.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json({ ...tenantServices });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error Updating Service' });
  }
};
const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.tenantService.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantServices = await prisma.tenantService.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json(tenantServices);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting tenant service' });
  }
};
// #endregion

// #region Tenant Equipment
const getEquipment = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const tenantEquipments = await prisma.tenantEquipment.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        equipment: true,
      },
    });

    res.status(200).json(tenantEquipments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tenant equipments' });
  }
};
const addEquipment = async (req: Request, res: Response) => {
  const { equipment } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantEquipment.create({
      data: {
        id: equipment.id,
        equipmentId: equipment.equipmentId,
        tenantId: tenantId!,
        pricePolicy: equipment.pricePolicy,
        isActive: equipment.isActive ?? true,
        price: equipment.price,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantEquipments = await prisma.tenantEquipment.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        equipment: true,
      },
    });

    res.status(201).json({ ...tenantEquipments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding equipment' });
  }
};
const updateEquipment = async (req: Request, res: Response) => {
  const { equipment } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    const existingEquipment = await prisma.tenantEquipment.findUnique({
      where: { id: equipment.id },
    });

    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    await prisma.tenantEquipment.update({
      where: { id: equipment.id },
      data: {
        pricePolicy: equipment.pricePolicy,
        isActive: equipment.isActive ?? true,
        price: equipment.price,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantEquipments = await prisma.tenantEquipment.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        equipment: true,
      },
    });

    res.status(200).json({ ...tenantEquipments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating equipment' });
  }
};
const deleteEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.tenantEquipment.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantEquipments = await prisma.tenantEquipment.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        equipment: true,
      },
    });

    res.status(200).json({ ...tenantEquipments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting tenant equipment' });
  }
};
// #endregion

// #region Tenant Insurance
const getInsurance = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const tenantInsurances = await prisma.tenantInsurance.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json(tenantInsurances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tenant insurances' });
  }
};
const addInsurance = async (req: Request, res: Response) => {
  const { insurance } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantInsurance.create({
      data: {
        id: insurance.id,
        insurance: insurance.insurance,
        description: insurance.description,
        tenantId: tenantId!,
        pricePolicy: insurance.pricePolicy,
        isActive: insurance.isActive ?? true,
        price: insurance.price,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantInsurances = await prisma.tenantInsurance.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(201).json({ ...tenantInsurances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding insurance' });
  }
};
const updateInsurance = async (req: Request, res: Response) => {
  const { insurance } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantInsurance.update({
      where: { id: insurance.id },
      data: {
        pricePolicy: insurance.pricePolicy,
        isActive: insurance.isActive ?? true,
        price: insurance.price,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantInsurances = await prisma.tenantInsurance.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json({ ...tenantInsurances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating insurance' });
  }
};
const deleteInsurance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantInsurance.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantInsurances = await prisma.tenantInsurance.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json({ ...tenantInsurances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting tenant insurance' });
  }
};
// #endregion

// #region User Roles
const getTenantRoles = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const roles = await prisma.userRole.findMany({
      where: { tenantId, isDeleted: false, show: true },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tenant roles' });
  }
};
const getTenantRolesById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  try {
    const role = await prisma.userRole.findUnique({
      where: { id, tenantId, show: true, isDeleted: false },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
};
const assignPermissionsToRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { roleId, permissions } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    const role = await prisma.userRole.findUnique({
      where: { id: roleId, tenantId },
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await prisma.userRolePermission.deleteMany({
      where: { roleId: role.id },
    });

    await prisma.userRolePermission.createMany({
      data: permissions.map((perm: any) => ({
        roleId,
        permissionId: perm.id,
        assignedBy: userId,
        assignedAt: new Date(),
      })),
    });

    const updatedRoles = await prisma.userRole.findMany({
      where: { tenantId },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.status(200).json(updatedRoles);
  } catch (error) {
    next(error);
  }
};
const addTenantRole = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.userRole.create({
      data: {
        name,
        description,
        tenantId: tenantId!,
        updatedBy: userId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const roles = await prisma.userRole.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });
    res.status(201).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating tenant role' });
  }
};
const updateTenantRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.userRole.update({
      where: { id },
      data: {
        name,
        description,
        updatedBy: userId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const roles = await prisma.userRole.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });
    res.status(201).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating tenant role' });
  }
};
// #endregion

// #region Tenant Reminders
const getTenantReminders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tenantId = req.user?.tenantId;
  try {
    const reminders = await prisma.tenantReminders.findMany({
      where: { tenantId: tenantId },
    });

    res.status(200).json(reminders);
  } catch (error) {
    next(error);
  }
};
const addTenantReminder = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  try {
    // const newReminder = await prisma.tenantReminders.create({
    //   data: {
    //     reminder,
    //     date: new Date(date),
    //     tenantId: tenantId!,
    //     updatedBy: userId,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    // });

    const reminders = await prisma.tenantReminders.findMany({
      where: { tenantId: tenantId },
      orderBy: { date: 'asc' },
    });

    res.status(201).json(reminders);
  } catch (error) {
    logger.e(error, 'Error adding tenant reminder');
  }
};
const updateTenantReminder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    const existingReminder = await prisma.tenantReminders.findUnique({
      where: { id },
    });

    await prisma.tenantReminders.update({
      where: { id },
      data: {
        completed: !existingReminder?.completed,
        completedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    const reminders = await prisma.tenantReminders.findMany({
      where: { tenantId: tenantId },
      orderBy: { date: 'asc' },
    });

    res.status(200).json(reminders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating tenant reminder' });
  }
};
// #endregion

// #region Tenant Currency Rates
const getTenantCurrencyRates = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  try {
    const currencyRates = await prisma.tenantCurrencyRate.findMany({
      where: { tenantId },
      include: {
        currency: true,
      },
    });

    res.status(200).json(currencyRates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tenant currency rates' });
  }
};
const updateTenantCurrencyRate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { rate } = req.body;
  const tenantId = req.user?.tenantId;
  try {
    const existingRate = await prisma.tenantCurrencyRate.findUnique({
      where: { id: rate.id },
    });

    if (!existingRate) {
      return res.status(404).json({ message: 'Currency rate not found' });
    }

    await prisma.tenantCurrencyRate.update({
      where: { id: rate.id },
      data: {
        fromRate: rate.fromRate,
        toRate: rate.toRate,
        enabled: rate.enabled,
        updatedAt: new Date(),
      },
    });

    const currencyRates = await prisma.tenantCurrencyRate.findMany({
      where: { tenantId },
      include: {
        currency: true,
      },
    });

    res.status(200).json(currencyRates);
  } catch (error) {
    next(error);
  }
};
// #endregion

// #region Tenant Notifications
const getTenantNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tenantId = req.user?.tenantId;
  try {
    const notifications = await prisma.tenantNotification.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  try {
    const notification = await prisma.tenantNotification.findUnique({
      where: { id, tenantId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await prisma.tenantNotification.update({
      where: { id },
      data: { read: true },
    });

    const notifications = await prisma.tenantNotification.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tenantId = req.user?.tenantId;
  try {
    await prisma.tenantNotification.updateMany({
      where: { tenantId, read: false, isDeleted: false },
      data: { read: true },
    });

    const notifications = await prisma.tenantNotification.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  try {
    const notification = await prisma.tenantNotification.findUnique({
      where: { id, tenantId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await prisma.tenantNotification.update({
      where: { id },
      data: { isDeleted: true },
    });

    const notifications = await prisma.tenantNotification.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
//#endregion

export default {
  getTenantById,
  getTenantExtras,
  createTenant,
  updateTenant,
  getTenantLocations,
  initializeTenantLocations,
  createTenantLocation,
  updateTenantLocation,
  deleteTenantLocation,
  getServices,
  addService,
  updateService,
  deleteService,
  getInsurance,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipment,
  addInsurance,
  updateInsurance,
  deleteInsurance,
  getTenantRentalActivity,
  getTenantReminders,
  getTenantRoles,
  getTenantRolesById,
  assignPermissionsToRole,
  addTenantRole,
  updateTenantRole,
  addTenantReminder,
  updateTenantReminder,
  getTenantCurrencyRates,
  updateTenantCurrencyRate,
  getTenantNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
