"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_repository_1 = require("../repository/customer.repository");
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const logger_config_1 = __importDefault(require("../config/logger.config"));
const rental_repository_1 = require("../repository/rental.repository");
const getCustomers = async (req, res) => {
    const tenantId = req.user?.tenantId;
    try {
        const customers = await customer_repository_1.customerRepo.getCustomers(tenantId);
        res.status(200).json(customers);
    }
    catch (error) {
        logger_config_1.default.handleError(res, error, 'fetching customers');
    }
};
const getCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await customer_repository_1.customerRepo.getCustomerById(id, req.user?.tenantId);
        const rentals = await rental_repository_1.rentalRepo.getRentalsByCustomerId(id, req.user?.tenantId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        const data = {
            ...customer,
            rentals,
        };
        res.status(200).json(data);
    }
    catch (error) {
        logger_config_1.default.handleError(res, error, 'getting customer by ID');
    }
};
const addCustomer = async (req, res) => {
    const { customer } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            await tx.customer.create({
                data: {
                    id: customer.id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    gender: customer.gender,
                    dateOfBirth: customer.dateOfBirth,
                    email: customer.email,
                    phone: customer.phone,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    updatedBy: userId,
                    profileImage: customer.profileImage,
                    tenantId: tenantId,
                    status: customer.status,
                },
            });
            await tx.driverLicense.create({
                data: {
                    id: customer.license.id,
                    classId: customer.license.classId,
                    countryId: customer.license.countryId,
                    customerId: customer.id,
                    licenseNumber: customer.license.licenseNumber,
                    licenseIssued: customer.license.licenseIssued,
                    licenseExpiry: customer.license.licenseExpiry,
                    image: customer.license.image,
                },
            });
            await tx.customerAddress.create({
                data: {
                    customer: { connect: { id: customer.id } },
                    street: customer.address.street,
                    village: customer.address.villageId
                        ? { connect: { id: customer.address.villageId } }
                        : undefined,
                    state: customer.address.stateId
                        ? { connect: { id: customer.address.stateId } }
                        : undefined,
                    country: customer.address.countryId
                        ? { connect: { id: customer.address.countryId } }
                        : undefined,
                },
            });
            if (customer.apps && customer.apps.length > 0) {
                await tx.customerMessengerApp.createMany({
                    data: customer.apps.map((app) => ({
                        id: app.id,
                        customerId: customer.id,
                        appId: app.appId,
                        account: app.account,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })),
                });
            }
        });
        const customers = await customer_repository_1.customerRepo.getCustomers(tenantId);
        res.status(201).json(customers);
    }
    catch (error) {
        logger_config_1.default.handleError(res, error, 'adding customer');
    }
};
const updateCustomer = async (req, res) => {
    const { customer } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            await tx.customer.update({
                where: { id: customer.id },
                data: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    gender: customer.gender,
                    dateOfBirth: customer.dateOfBirth,
                    email: customer.email,
                    phone: customer.phone,
                    updatedBy: userId,
                    updatedAt: new Date(),
                    profileImage: customer.profileImage,
                    status: customer.status,
                },
            });
            await tx.driverLicense.update({
                where: { customerId: customer.id },
                data: {
                    classId: customer.license.classId,
                    countryId: customer.license.countryId,
                    licenseNumber: customer.license.licenseNumber,
                    licenseIssued: customer.license.licenseIssued,
                    licenseExpiry: customer.license.licenseExpiry,
                    image: customer.license.image,
                },
            });
            await tx.customerAddress.update({
                where: { customerId: customer.id },
                data: {
                    street: customer.address.street,
                    village: customer.address.villageId
                        ? { connect: { id: customer.address.villageId } }
                        : undefined,
                    state: customer.address.stateId
                        ? { connect: { id: customer.address.stateId } }
                        : undefined,
                    country: customer.address.countryId
                        ? { connect: { id: customer.address.countryId } }
                        : undefined,
                },
            });
            if (customer.apps && customer.apps.length > 0) {
                await tx.customerMessengerApp.deleteMany({
                    where: { customerId: customer.id },
                });
                await tx.customerMessengerApp.createMany({
                    data: customer.apps.map((app) => ({
                        id: app.id,
                        customerId: customer.id,
                        appId: app.appId,
                        account: app.account,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })),
                });
            }
        });
        const customers = await customer_repository_1.customerRepo.getCustomers(tenantId);
        res.status(201).json(customers);
    }
    catch (error) {
        logger_config_1.default.handleError(res, error, 'updating customer');
    }
};
const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.customer.update({
            where: { id },
            data: {
                isDeleted: true,
                updatedBy: userId,
                updatedAt: new Date(),
            },
        });
        const customers = await customer_repository_1.customerRepo.getCustomers(tenantId);
        res.status(201).json(customers);
    }
    catch (error) {
        logger_config_1.default.handleError(res, error, 'deleting customer');
    }
};
// #region Customer Document
const addCustomerDocument = async (req, res) => {
    const { document } = req.body;
    const userId = req.user?.id;
    try {
        await prisma_config_1.default.customerDocument.create({
            data: {
                id: document.id,
                documentId: document.documentId,
                customerId: document.customerId,
                documentNumber: document.documentNumber,
                issuedDate: document.issuedDate,
                expiryDate: document.expiryDate,
                documents: document.documents,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: userId,
                updatedBy: userId,
                notes: document.notes,
            },
        });
        const documents = await prisma_config_1.default.customerDocument.findMany({
            where: {
                customerId: document.customerId,
            },
        });
        res.status(201).json(documents);
    }
    catch (error) {
        logger_config_1.default.handleError(res, error, 'adding customer document');
    }
};
exports.default = {
    getCustomers,
    getCustomerById,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addCustomerDocument,
};
