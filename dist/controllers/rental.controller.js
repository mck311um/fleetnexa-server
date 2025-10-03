"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_repository_1 = require("../repository/tenant.repository");
const pdf_service_1 = __importDefault(require("../services/pdf.service"));
const logger_config_1 = __importDefault(require("../config/logger.config"));
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const generator_service_1 = __importDefault(require("../services/generator.service"));
const rental_repository_1 = require("../repository/rental.repository");
const formatter_1 = __importDefault(require("../utils/formatter"));
const vehicle_repository_1 = require("../repository/vehicle.repository");
const app_1 = __importDefault(require("../app"));
const getRentals = async (req, res, next) => {
    const tenantId = req.user?.tenantId;
    try {
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }
        const rentals = await rental_repository_1.rentalRepo.getRentals(tenantId);
        return res.status(200).json(rentals);
    }
    catch (error) {
        next(error);
    }
};
const getRentalById = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    try {
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }
        const rental = await rental_repository_1.rentalRepo.getRentalById(id, tenantId);
        if (!rental) {
            return res.status(404).json({ error: 'Rental not found' });
        }
        return res.status(200).json(rental);
    }
    catch (error) {
        next(error);
    }
};
const handleRental = async (req, res, next) => {
    const { rental } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!rental) {
        return res.status(400).json({ error: 'Rental data is required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
            if (!rental.rentalNumber) {
                const rentalNumber = await generator_service_1.default.generateRentalNumber(tenantId);
                rental.rentalNumber = rentalNumber;
            }
            if (!rental.bookingCode) {
                const bookingCode = generator_service_1.default.generateBookingCode(tenant?.tenantCode || '', rental.rentalNumber);
                rental.bookingCode = bookingCode;
            }
            const rentalData = {
                startDate: rental.startDate,
                endDate: rental.endDate,
                pickupLocationId: rental.pickupLocationId,
                returnLocationId: rental.returnLocationId,
                vehicleId: rental.vehicleId,
                agent: rental.agent,
                signature: rental.signature,
                createdAt: new Date(),
                createdBy: userId,
                updatedAt: new Date(),
                updatedBy: userId,
                vehicleGroupId: rental.vehicleGroupId,
                tenantId,
                status: rental.status,
                notes: rental.notes,
                rentalNumber: rental.rentalNumber,
                bookingCode: rental.bookingCode,
                chargeTypeId: rental.chargeTypeId,
            };
            await tx.rental.upsert({
                where: { id: rental.id },
                create: { id: rental.id, ...rentalData },
                update: rentalData,
            });
            let upsertedValues = null;
            if (rental.values) {
                const valuesData = {
                    numberOfDays: parseFloat(rental.values.numberOfDays),
                    basePrice: parseFloat(rental.values.basePrice),
                    customBasePrice: rental.values.customBasePrice || false,
                    totalCost: parseFloat(rental.values.totalCost),
                    customTotalCost: rental.values.customTotalCost || false,
                    discount: parseFloat(rental.values.discount),
                    customDiscount: rental.values.customDiscount || false,
                    deliveryFee: parseFloat(rental.values.deliveryFee),
                    customDeliveryFee: rental.values.customDeliveryFee || false,
                    collectionFee: parseFloat(rental.values.collectionFee),
                    customCollectionFee: rental.values.customCollectionFee || false,
                    deposit: parseFloat(rental.values.deposit),
                    customDeposit: rental.values.customDeposit || false,
                    totalExtras: parseFloat(rental.values.totalExtras),
                    subTotal: parseFloat(rental.values.subTotal),
                    netTotal: parseFloat(rental.values.netTotal),
                    discountMin: parseFloat(rental.values.discountMin),
                    discountMax: parseFloat(rental.values.discountMax),
                    discountAmount: parseFloat(rental.values.discountAmount),
                    additionalDriverFees: parseFloat(rental.values.additionalDriverFees),
                    discountPolicy: rental.values.discountPolicy,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                upsertedValues = await tx.values.upsert({
                    where: { id: rental.values.id },
                    create: {
                        id: rental.values.id,
                        rental: {
                            connect: { id: rental.id },
                        },
                        ...valuesData,
                    },
                    update: valuesData,
                });
                if (rental.values.extras?.length) {
                    await tx.rentalExtra.deleteMany({
                        where: {
                            valuesId: upsertedValues.id,
                            id: {
                                notIn: rental.values.extras
                                    .map((e) => e.id)
                                    .filter(Boolean),
                            },
                        },
                    });
                    const extrasPromises = rental.values.extras.map((extra) => tx.rentalExtra.upsert({
                        where: { id: extra.id },
                        create: {
                            id: extra.id,
                            extraId: extra.extraId,
                            amount: extra.amount,
                            valuesId: upsertedValues.id,
                        },
                        update: {
                            extraId: extra.extraId,
                            amount: extra.amount,
                            valuesId: upsertedValues.id,
                        },
                    }));
                    await Promise.all(extrasPromises);
                }
                if (rental.drivers?.length) {
                    await tx.rentalDriver.deleteMany({
                        where: {
                            rentalId: rental.id,
                            id: {
                                notIn: rental.drivers.map((rd) => rd.id).filter(Boolean),
                            },
                        },
                    });
                    const rentalDriverPromises = rental.drivers.map((rd) => {
                        const where = rd.id
                            ? { id: rd.id }
                            : {
                                rentalId_driverId: {
                                    rentalId: rental.id,
                                    driverId: rd.driverId,
                                },
                            };
                        return tx.rentalDriver.upsert({
                            where,
                            create: {
                                id: rd.id,
                                rentalId: rental.id,
                                driverId: rd.driverId,
                            },
                            update: {
                                driverId: rd.driverId,
                            },
                        });
                    });
                    await Promise.all(rentalDriverPromises);
                }
            }
        });
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(rental.id, tenantId);
        const rentals = await rental_repository_1.rentalRepo.getRentals(tenantId);
        return res.status(200).json({ rentals, updatedRental });
    }
    catch (error) {
        next(error);
    }
};
const handleStorefrontRental = async (req, res, next) => {
    try {
        const { rental } = req.body;
        const booking = await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tenant_repository_1.tenantRepo.getTenantById(rental.tenantId);
            if (!tenant) {
                return res.status(404).json({ message: 'Tenant not found' });
            }
            const rentalNumber = await generator_service_1.default.generateRentalNumber(rental.tenantId);
            const bookingCode = generator_service_1.default.generateBookingCode(tenant.tenantCode, rentalNumber);
            const newRental = await tx.rental.create({
                data: {
                    startDate: new Date(rental.startDate),
                    endDate: new Date(rental.endDate),
                    pickupLocationId: rental.pickupLocationId,
                    returnLocationId: rental.returnLocationId,
                    vehicleId: rental.vehicleId,
                    agent: 'RENTNEXA',
                    createdAt: new Date(),
                    tenantId: rental.tenantId,
                    status: 'PENDING',
                    notes: rental.notes,
                    rentalNumber: rentalNumber,
                    bookingCode: bookingCode,
                },
                select: {
                    startDate: true,
                    endDate: true,
                    id: true,
                    rentalNumber: true,
                    bookingCode: true,
                    tenant: {
                        select: {
                            id: true,
                            tenantName: true,
                            email: true,
                            number: true,
                        },
                    },
                    vehicle: {
                        select: {
                            year: true,
                            brand: true,
                            model: true,
                            tenant: {
                                select: {
                                    currency: true,
                                },
                            },
                        },
                    },
                    pickup: true,
                    values: {
                        select: {
                            netTotal: true,
                        },
                    },
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
            const extrasPromises = rental.values.extras.map((extra) => tx.rentalExtra.upsert({
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
            }));
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
                        licenseIssued: rental.customer.license.licenseIssued,
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
                        isPrimary: true,
                    },
                });
            }
            else {
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
                        status: 'ACTIVE',
                    },
                });
                await tx.driverLicense.create({
                    data: {
                        customerId: customer.id,
                        licenseNumber: rental.customer.license.licenseNumber,
                        licenseExpiry: rental.customer.license.licenseExpiry,
                        licenseIssued: rental.customer.license.licenseIssued,
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
                        isPrimary: true,
                    },
                });
            }
            const vehicle = await vehicle_repository_1.vehicleRepo.getVehicleById(rental.vehicleId, rental.tenantId);
            const bookingNumber = newRental.rentalNumber;
            const actionUrl = `/app/bookings/${bookingNumber}`;
            const driverName = `${rental.customer.firstName} ${rental.customer.lastName}`;
            const vehicleName = `${vehicle?.brand?.brand} ${vehicle?.model?.model}`;
            const fromDate = formatter_1.default.formatDateToFriendlyDateShort(new Date(newRental.startDate));
            const toDate = formatter_1.default.formatDateToFriendlyDateShort(new Date(newRental.endDate));
            const message = `${driverName} just submitted a booking request for a ${vehicleName}, scheduled from ${fromDate} to ${toDate}, via your storefront.`;
            const notification = await tx.tenantNotification.create({
                data: {
                    tenantId: tenant.id,
                    title: 'New Booking Request',
                    type: 'BOOKING',
                    priority: 'HIGH',
                    message,
                    actionUrl,
                    read: false,
                    createdAt: new Date(),
                },
            });
            const io = app_1.default.get('io');
            io.to(tenant.id).emit('tenant-notification', notification);
            return newRental;
        });
        res.status(201).json({ booking, values: rental.values });
    }
    catch (error) {
        next(error);
    }
};
const confirmRental = async (req, res, next) => {
    const { rental } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            await tx.rental.update({
                where: { id: rental.id },
                data: {
                    status: 'CONFIRMED',
                    updatedAt: new Date(),
                    updatedBy: userId,
                },
            });
            const primaryDriver = await tx.rentalDriver.findFirst({
                where: {
                    rentalId: rental.id,
                    isPrimary: true,
                },
                select: { driverId: true },
            });
            await tx.rentalActivity.create({
                data: {
                    rentalId: rental.id,
                    action: 'BOOKED',
                    createdAt: new Date(rental.startDate) < new Date()
                        ? new Date(rental.startDate)
                        : new Date(),
                    createdBy: userId,
                    customerId: primaryDriver?.driverId,
                    vehicleId: rental.vehicleId,
                    tenantId,
                },
            });
        }, {
            maxWait: 20000,
            timeout: 15000,
        });
        const rentals = await rental_repository_1.rentalRepo.getRentals(tenantId);
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(rental.id, tenantId);
        return res.status(201).json({ updatedRental, rentals });
    }
    catch (error) {
        next(error);
    }
};
const declineRental = async (req, res, next) => {
    const { rental } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            await tx.rental.update({
                where: { id: rental.id },
                data: {
                    status: 'DECLINED',
                    updatedAt: new Date(),
                    updatedBy: userId,
                },
            });
        });
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(rental.id, tenantId);
        const rentals = await rental_repository_1.rentalRepo.getRentals(tenantId);
        return res.status(200).json({ updatedRental, rentals });
    }
    catch (error) {
        next(error);
    }
};
const cancelRental = async (req, res, next) => {
    const { rental } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            await tx.rental.update({
                where: { id: rental.id },
                data: {
                    status: 'CANCELED',
                    updatedAt: new Date(),
                    updatedBy: userId,
                },
            });
            const primaryDriver = await tx.rentalDriver.findFirst({
                where: {
                    rentalId: rental.id,
                    isPrimary: true,
                },
                select: { driverId: true },
            });
            await tx.rentalActivity.create({
                data: {
                    rentalId: rental.id,
                    action: 'CANCELED',
                    createdAt: new Date(),
                    createdBy: userId,
                    customerId: primaryDriver?.driverId,
                    vehicleId: rental.vehicleId,
                    tenantId: tenantId,
                },
            });
        });
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(rental.id, tenantId);
        const rentals = await rental_repository_1.rentalRepo.getRentals(tenantId);
        return res.status(200).json({ updatedRental, rentals });
    }
    catch (error) {
        next(error);
    }
};
const startRental = async (req, res) => {
    const { rental } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            await tx.rental.update({
                where: { id: rental.id },
                data: {
                    status: 'ACTIVE',
                    updatedAt: new Date(),
                    updatedBy: userId,
                },
            });
            const primaryDriver = await tx.rentalDriver.findFirst({
                where: {
                    rentalId: rental.id,
                    isPrimary: true,
                },
                select: { driverId: true },
            });
            const rentedStatus = await tx.vehicleStatus.findFirst({
                where: { status: 'Rented' },
                select: { id: true },
            });
            if (!rentedStatus) {
                throw new Error('Vehicle status "RENTED" not found');
            }
            await tx.vehicle.update({
                where: { id: rental.vehicleId },
                data: {
                    vehicleStatusId: rentedStatus.id,
                    updatedAt: new Date(),
                    updatedBy: userId,
                },
            });
            await tx.rentalActivity.create({
                data: {
                    rentalId: rental.id,
                    action: 'PICKED_UP',
                    createdAt: rental.startDate,
                    createdBy: userId,
                    customerId: primaryDriver?.driverId,
                    vehicleId: rental.vehicleId,
                    tenantId: tenantId,
                },
            });
        });
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(rental.id, tenantId);
        const rentals = await rental_repository_1.rentalRepo.getRentals(tenantId);
        return res.status(200).json({ updatedRental, rentals });
    }
    catch (error) {
        return logger_config_1.default.handleError(res, error, 'starting rental');
    }
};
const endRental = async (req, res, next) => {
    const { rental } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            await tx.rental.update({
                where: { id: rental.id },
                data: {
                    status: 'COMPLETED',
                    updatedAt: rental.returnDate,
                    updatedBy: userId,
                },
            });
            const primaryDriver = await tx.rentalDriver.findFirst({
                where: {
                    rentalId: rental.id,
                    isPrimary: true,
                },
                select: { driverId: true },
            });
            const rentedStatus = await tx.vehicleStatus.findFirst({
                where: { status: 'Pending Inspection' },
                select: { id: true },
            });
            if (!rentedStatus) {
                throw new Error('Vehicle status "Pending Inspection" not found');
            }
            if (rental.applyLateFee) {
                await tx.values.update({
                    where: { rentalId: rental.id },
                    data: {
                        lateFee: rental.lateFee,
                    },
                });
            }
            await tx.vehicle.update({
                where: { id: rental.vehicleId },
                data: {
                    vehicleStatusId: rentedStatus.id,
                    updatedAt: new Date(),
                    updatedBy: userId,
                },
            });
            await tx.rentalActivity.create({
                data: {
                    rentalId: rental.id,
                    action: 'RETURNED',
                    createdAt: rental.returnDate,
                    createdBy: userId,
                    customerId: primaryDriver?.driverId,
                    vehicleId: rental.vehicleId,
                    tenantId: tenantId,
                },
            });
        });
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(rental.id, tenantId);
        return res.status(200).json(updatedRental);
    }
    catch (error) {
        next(error);
    }
};
const deleteRental = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    try {
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }
        const rental = await prisma_config_1.default.rental.findUnique({
            where: { id },
        });
        if (!rental) {
            return res.status(404).json({ error: 'Rental not found' });
        }
        await prisma_config_1.default.rental.update({
            where: { id },
            data: {
                isDeleted: true,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        });
        const rentals = await rental_repository_1.rentalRepo.getRentals(tenantId);
        return res.status(201).json(rentals);
    }
    catch (error) {
        next(error);
    }
};
const generateInvoice = async (req, res) => {
    const { invoiceData } = req.body;
    const { rentalId } = req.params;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        let invoiceNumber;
        const invoice = await prisma_config_1.default.invoice.findUnique({
            where: { rentalId },
        });
        if (invoice) {
            invoiceNumber = invoice.invoiceNumber;
        }
        else {
            invoiceNumber = await generator_service_1.default.generateInvoiceNumber(tenantId);
        }
        const rental = await rental_repository_1.rentalRepo.getRentalById(rentalId, tenantId);
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        const { publicUrl } = await pdf_service_1.default.createInvoice({
            ...invoiceData,
            invoiceNumber,
        }, invoiceNumber, tenant?.tenantCode);
        const primaryDriver = await prisma_config_1.default.rentalDriver.findFirst({
            where: {
                rentalId: rental?.id,
                isPrimary: true,
            },
            select: { driverId: true },
        });
        await prisma_config_1.default.invoice.upsert({
            where: { rentalId },
            create: {
                invoiceNumber,
                amount: rental?.values?.netTotal || 0,
                customerId: primaryDriver?.driverId || '',
                rentalId: rental?.id || '',
                tenantId: tenantId,
                createdAt: new Date(),
                createdBy: userId,
                invoiceUrl: publicUrl,
            },
            update: {
                amount: rental?.values?.netTotal || 0,
                customerId: primaryDriver?.driverId || '',
                tenantId: tenantId,
                invoiceUrl: publicUrl,
                updatedAt: new Date(),
                updatedBy: userId,
            },
        });
        return res.status(201).json(publicUrl);
    }
    catch (error) {
        console.error('Error generating invoice number:', error);
        throw new Error('Error generating invoice number');
    }
};
const generateRentalAgreement = async (req, res) => {
    const { agreementData } = req.body;
    const { rentalId } = req.params;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        let agreementNumber;
        const agreement = await prisma_config_1.default.rentalAgreement.findUnique({
            where: { rentalId },
        });
        if (agreement) {
            agreementNumber = agreement.number;
        }
        else {
            agreementNumber = await generator_service_1.default.generateRentalAgreementNumber(tenantId);
        }
        const rental = await rental_repository_1.rentalRepo.getRentalById(rentalId, tenantId);
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        const { publicUrl, signablePublicUrl } = await pdf_service_1.default.createAgreement({
            ...agreementData,
            agreementNumber,
        }, agreementNumber, tenant?.tenantCode);
        const primaryDriver = await prisma_config_1.default.rentalDriver.findFirst({
            where: {
                rentalId: rental?.id,
                isPrimary: true,
            },
            select: { driverId: true },
        });
        await prisma_config_1.default.rentalAgreement.upsert({
            where: { rentalId },
            create: {
                number: agreementNumber,
                customerId: primaryDriver?.driverId || '',
                rentalId: rental?.id || '',
                tenantId: tenantId,
                createdAt: new Date(),
                createdBy: userId,
                agreementUrl: publicUrl,
                signableUrl: signablePublicUrl,
            },
            update: {
                customerId: primaryDriver?.driverId || '',
                tenantId: tenantId,
                agreementUrl: publicUrl,
                signableUrl: signablePublicUrl,
                updatedAt: new Date(),
                updatedBy: userId,
            },
        });
        return res.status(201).json(publicUrl);
    }
    catch (error) {
        console.error('Error generating rental agreement number:', error);
        throw new Error('Error generating rental agreement number');
    }
};
const addRentalCharge = async (req, res, next) => {
    try {
        const { charge } = req.body;
        const tenantId = req.user?.tenantId;
        await prisma_config_1.default.rentalCharge.create({
            data: {
                id: charge.id,
                rentalId: charge.rentalId,
                charge: charge.charge,
                reason: charge.reason,
                amount: charge.amount,
                customerId: charge.customerId,
                tenantId: tenantId,
            },
        });
        const rental = await rental_repository_1.rentalRepo.getRentalById(charge.rentalId, tenantId);
        res.status(201).json(rental);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getRentals,
    getRentalById,
    handleRental,
    handleStorefrontRental,
    confirmRental,
    declineRental,
    cancelRental,
    startRental,
    endRental,
    generateInvoice,
    generateRentalAgreement,
    deleteRental,
    addRentalCharge,
};
