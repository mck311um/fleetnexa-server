import prisma from "../config/prisma.config";
import { Request, Response, NextFunction } from "express";
import { tenantRepo } from "../repository/tenant.repository";
import { vehicleRepo } from "../repository/vehicle.repository";
import numberGenerator from "../services/numberGenerator.service";
import app from "../app";

const getAdminData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const caribbeanCountries = await prisma.caribbeanCountry.findMany({
      where: {
        isActive: true,
      },
      include: { country: true },
    });
    const countries = await prisma.country.findMany();
    const villages = await prisma.village.findMany();
    const states = await prisma.state.findMany();
    const bodyTypes = await prisma.vehicleBodyType.findMany();
    const tenants = await prisma.tenant.findMany({
      where: {
        storefrontEnabled: true,
      },
      select: {
        id: true,
        tenantName: true,
        logo: true,
        rating: true,
        description: true,
        _count: {
          select: {
            vehicles: true,
            ratings: true,
          },
        },
        address: {
          include: {
            country: true,
            state: true,
            village: true,
          },
        },
      },
    });
    const currencies = await prisma.currency.findMany();

    res.status(200).json({
      countries,
      caribbeanCountries,
      villages,
      states,
      bodyTypes,
      currencies,
      tenants,
    });
  } catch (error) {}
};

const getFeaturedData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const featuredData = await prisma.$transaction(async (tx) => {
      const caribbeanCountries = await tx.caribbeanCountry.findMany({
        where: {
          isActive: true,
        },
        include: {
          country: true,
        },
      });

      const randomCountries = caribbeanCountries
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      const featuredCountries = await Promise.all(
        randomCountries.map(async (country) => {
          const tenantCount = await prisma.tenant.count({
            where: {
              address: {
                countryId: country.countryId,
              },
            },
          });

          return {
            ...country,
            tenantCount,
          };
        })
      );

      const vehicles = await tx.vehicle.findMany({
        where: {
          tenant: {
            storefrontEnabled: true,
          },
        },
        select: {
          id: true,
          year: true,
          color: true,
          licensePlate: true,
          engineVolume: true,
          steering: true,
          fuelLevel: true,
          featuredImage: true,
          vehicleStatus: true,
          wheelDrive: true,
          images: true,
          brand: true,
          numberOfSeats: true,
          numberOfDoors: true,
          transmission: true,
          features: true,
          fuelType: true,
          dayPrice: true,
          minimumRental: true,
          drivingExperience: true,
          discounts: true,
          model: {
            include: {
              bodyType: true,
            },
          },
          rentals: {
            where: {
              status: {
                in: ["PENDING", "ACTIVE", "COMPLETED"],
              },
            },
            select: {
              startDate: true,
              endDate: true,
            },
          },
          tenant: {
            select: {
              id: true,
              tenantName: true,
              currency: true,
              logo: true,
              securityDeposit: true,
              currencyRates: {
                include: {
                  currency: true,
                },
              },
              address: {
                include: {
                  country: true,
                  state: true,
                  village: true,
                },
              },
            },
          },
        },
      });

      const featuredVehicles = vehicles
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);

      const tenants = await tx.tenant.findMany({
        where: {
          storefrontEnabled: true,
        },
        select: {
          id: true,
          tenantName: true,
          logo: true,
          _count: {
            select: {
              vehicles: true,
            },
          },
          address: {
            include: {
              country: true,
              state: true,
              village: true,
            },
          },
        },
      });

      const featuredTenants = tenants
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);

      return {
        featuredCountries,
        featuredVehicles,
        featuredTenants,
      };
    });

    res.status(200).json(featuredData);
  } catch (error) {}
};
const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        tenant: {
          storefrontEnabled: true,
        },
      },
      select: {
        id: true,
        year: true,
        color: true,
        licensePlate: true,
        engineVolume: true,
        steering: true,
        fuelLevel: true,
        featuredImage: true,
        vehicleStatus: true,
        wheelDrive: true,
        images: true,
        brand: true,
        numberOfSeats: true,
        numberOfDoors: true,
        transmission: true,
        features: true,
        fuelType: true,
        dayPrice: true,
        minimumRental: true,
        drivingExperience: true,
        minimumAge: true,
        fuelPolicy: true,
        discounts: true,
        rentals: {
          where: {
            status: {
              in: ["PENDING", "ACTIVE", "COMPLETED"],
            },
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },
        model: {
          include: {
            bodyType: true,
          },
        },
        tenant: {
          select: {
            id: true,
            tenantName: true,
            logo: true,
            currency: true,
            tenantLocations: {
              where: { storefrontEnabled: true },
            },
            securityDeposit: true,
            additionalDriverFee: true,
            currencyRates: {
              include: {
                currency: true,
              },
            },
            address: {
              include: {
                country: true,
                state: true,
                village: true,
              },
            },
          },
        },
      },
    });

    const updatedVehicles = await Promise.all(
      vehicles.map(async (vehicle) => {
        const [tenantServices, tenantEquipments] = await Promise.all([
          prisma.tenantService.findMany({
            where: { tenantId: vehicle.tenant?.id, isDeleted: false },
            include: { service: true },
          }),
          prisma.tenantEquipment.findMany({
            where: { tenantId: vehicle.tenant?.id, isDeleted: false },
            include: { equipment: true },
          }),
        ]);

        const combined = [
          ...tenantServices.map((item) => ({
            ...item,
            type: "Service",
            name: item.service.service,
            icon: item.service.icon,
            description: item.service.description,
          })),
          ...tenantEquipments.map((item) => ({
            ...item,
            type: "Equipment",
            name: item.equipment.equipment,
            icon: item.equipment.icon,
            description: item.equipment.description,
          })),
        ];

        return {
          ...vehicle,
          extras: combined,
        };
      })
    );

    return res.status(200).json(updatedVehicles);
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        year: true,
        color: true,
        licensePlate: true,
        engineVolume: true,
        steering: true,
        fuelLevel: true,
        featuredImage: true,
        vehicleStatus: true,
        wheelDrive: true,
        images: true,
        brand: true,
        numberOfSeats: true,
        numberOfDoors: true,
        transmission: true,
        features: true,
        fuelType: true,
        dayPrice: true,
        minimumRental: true,
        drivingExperience: true,
        minimumAge: true,
        fuelPolicy: true,
        discounts: true,
        rentals: {
          where: {
            status: {
              in: ["PENDING", "ACTIVE", "COMPLETED"],
            },
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },
        model: {
          include: {
            bodyType: true,
          },
        },
        tenant: {
          select: {
            id: true,
            tenantName: true,
            logo: true,
            currency: true,
            tenantLocations: {
              where: { storefrontEnabled: true },
            },
            securityDeposit: true,
            additionalDriverFee: true,
            currencyRates: {
              include: {
                currency: true,
              },
            },
            address: {
              include: {
                country: true,
                state: true,
                village: true,
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const [tenantServices, tenantEquipments] = await Promise.all([
      prisma.tenantService.findMany({
        where: { tenantId: vehicle.tenant?.id, isDeleted: false },
        include: { service: true },
      }),
      prisma.tenantEquipment.findMany({
        where: { tenantId: vehicle.tenant?.id, isDeleted: false },
        include: { equipment: true },
      }),
    ]);

    const combined = [
      ...tenantServices.map((item) => ({
        ...item,
        type: "Service",
        name: item.service.service,
        icon: item.service.icon,
        description: item.service.description,
      })),
      ...tenantEquipments.map((item) => ({
        ...item,
        type: "Equipment",
        name: item.equipment.equipment,
        icon: item.equipment.icon,
        description: item.equipment.description,
      })),
    ];

    const updatedVehicle = {
      ...vehicle,
      extras: combined,
    };

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    next(error);
  }
};
const getTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        storefrontEnabled: true,
      },
      select: {
        id: true,
        tenantName: true,
        logo: true,
        rating: true,
        description: true,
        _count: {
          select: {
            vehicles: true,
            ratings: true,
          },
        },
        address: {
          include: {
            country: true,
            state: true,
            village: true,
          },
        },
      },
    });

    return res.status(200).json(tenants);
  } catch (error) {
    next(error);
  }
};
const getTenantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        tenantName: true,
        logo: true,
        rating: true,
        description: true,
        _count: {
          select: {
            vehicles: true,
            ratings: true,
          },
        },
        address: {
          include: {
            country: true,
            state: true,
            village: true,
          },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    return res.status(200).json(tenant);
  } catch (error) {
    next(error);
  }
};

const addBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rental } = req.body;

    const booking = await prisma.$transaction(async (tx) => {
      const tenant = await tenantRepo.getTenantById(rental.tenantId);

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const rentalNumber = await numberGenerator.generateRentalNumber(
        rental.tenantId
      );

      const newRental = await tx.rental.create({
        data: {
          startDate: new Date(rental.startDate),
          endDate: new Date(rental.endDate),
          pickupLocationId: rental.pickupLocationId,
          returnLocationId: rental.returnLocationId,
          vehicleId: rental.vehicleId,
          agent: "RENTNEXA",
          createdAt: new Date(),
          tenantId: rental.tenantId,
          status: "PENDING",
          notes: rental.notes,
          rentalNumber: rentalNumber,
        },
        select: {
          startDate: true,
          endDate: true,
          id: true,
          rentalNumber: true,
        },
      });

      const values = await tx.values.create({
        data: {
          numberOfDays: parseFloat(rental.values.numberOfDays),
          basePrice: parseFloat(rental.values.basePrice),
          totalCost: parseFloat(rental.values.totalCost),
          discount: parseFloat(rental.values.discount),
          deliveryFee: parseFloat(rental.values.deliveryFee),
          collectionFee: parseFloat(rental.values.collectionFee),
          deposit: parseFloat(rental.values.deposit),
          totalExtras: parseFloat(rental.values.totalExtras),
          subTotal: parseFloat(rental.values.subTotal),
          netTotal: parseFloat(rental.values.netTotal),
          discountMin: parseFloat(rental.values.discountMin),
          discountMax: parseFloat(rental.values.discountMax),
          discountAmount: parseFloat(rental.values.discountAmount),
          additionalDriverFees: parseFloat(rental.values.additionalDriverFees),
          discountPolicy: rental.values.discountPolicy,
          rental: {
            connect: { id: newRental.id },
          },
        },
      });

      const extrasPromises = rental.values.extras.map((extra: any) =>
        tx.rentalExtra.upsert({
          where: { id: extra.id },
          create: {
            id: extra.id,
            extraId: extra.extraId,
            amount: extra.amount,
            valuesId: values.id,
          },
          update: {
            extraId: extra.extraId,
            amount: extra.amount,
            valuesId: values.id,
          },
        })
      );

      await Promise.all(extrasPromises);

      const existingCustomer = await tx.customer.findFirst({
        where: {
          tenantId: rental.tenantId,
          license: {
            licenseNumber: rental.customer.license.licenseNumber,
          },
        },
      });

      if (existingCustomer) {
        await tx.customer.update({
          where: { id: existingCustomer.id },
          data: {
            firstName: rental.customer.firstName,
            lastName: rental.customer.lastName,
            gender: rental.customer.gender,
            dateOfBirth: rental.customer.dateOfBirth,
            email: rental.customer.email,
            phone: rental.customer.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
            tenantId: tenant.id,
          },
        });

        await tx.driverLicense.update({
          where: { customerId: existingCustomer.id },
          data: {
            licenseExpiry: rental.customer.license.licenseExpiry,
          },
        });

        await tx.customerAddress.update({
          where: { customerId: existingCustomer.id },
          data: {
            street: rental.customer.address.street,
            village: rental.customer.address.villageId
              ? { connect: { id: rental.customer.address.villageId } }
              : undefined,
            state: rental.customer.address.stateId
              ? { connect: { id: rental.customer.address.stateId } }
              : undefined,
            country: rental.customer.address.countryId
              ? { connect: { id: rental.customer.address.countryId } }
              : undefined,
          },
        });

        await tx.rentalDriver.create({
          data: {
            rentalId: newRental.id,
            driverId: existingCustomer.id,
            primaryDriver: true,
          },
        });
      } else {
        const customer = await tx.customer.create({
          data: {
            firstName: rental.customer.firstName,
            lastName: rental.customer.lastName,
            gender: rental.customer.gender,
            dateOfBirth: rental.customer.dateOfBirth,
            email: rental.customer.email,
            phone: rental.customer.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
            tenantId: tenant.id,
            status: "ACTIVE",
          },
        });

        await tx.driverLicense.create({
          data: {
            customerId: customer.id,
            licenseNumber: rental.customer.license.licenseNumber,
            licenseExpiry: rental.customer.license.licenseExpiry,
          },
        });

        await tx.customerAddress.create({
          data: {
            customer: { connect: { id: customer.id } },
            street: rental.customer.address.street,
            village: rental.customer.address.villageId
              ? { connect: { id: rental.customer.address.villageId } }
              : undefined,
            state: rental.customer.address.stateId
              ? { connect: { id: rental.customer.address.stateId } }
              : undefined,
            country: rental.customer.address.countryId
              ? { connect: { id: rental.customer.address.countryId } }
              : undefined,
          },
        });

        await tx.rentalDriver.create({
          data: {
            rentalId: newRental.id,
            driverId: customer.id,
            primaryDriver: true,
          },
        });

        return newRental;
      }

      const vehicle = await vehicleRepo.getVehicleById(
        rental.vehicleId,
        rental.tenantId
      );

      const bookingNumber = newRental.rentalNumber;
      const actionUrl = `/app/bookings/${bookingNumber}`;
      const driverName = `${rental.customer.firstName} ${rental.customer.lastName}`;
      const vehicleName = `${vehicle?.brand?.brand} ${vehicle?.model?.model}`;
      const fromDate = formatDate(new Date(newRental.startDate));
      const toDate = formatDate(new Date(newRental.endDate));
      const message = `${driverName} just submitted a booking request for a ${vehicleName}, scheduled from ${fromDate} to ${toDate}, via your storefront.`;

      const notification = await tx.tenantNotification.create({
        data: {
          tenantId: tenant.id,
          title: "New Booking Request",
          type: "BOOKING",
          priority: "HIGH",
          message,
          actionUrl,
          read: false,
          createdAt: new Date(),
        },
      });

      const io = app.get("io");
      io.to(tenant.id).emit("tenant-notification", notification);
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default {
  getAdminData,
  getFeaturedData,
  getVehicles,
  getVehicleById,
  getTenants,
  getTenantById,
  addBooking,
};
