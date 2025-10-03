"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const logger_1 = require("../config/logger");
const getData = async (req, res) => {
    try {
        const vehicleParts = await prisma_config_1.default.vehiclePart.findMany();
        const currencies = await prisma_config_1.default.currency.findMany();
        const fuelTypes = await prisma_config_1.default.fuelType.findMany();
        const paymentMethods = await prisma_config_1.default.paymentMethod.findMany();
        const chargeTypes = await prisma_config_1.default.chargeType.findMany();
        const transmissions = await prisma_config_1.default.transmission.findMany();
        const vehicleFeatures = await prisma_config_1.default.vehicleFeature.findMany();
        const vehicleStatuses = await prisma_config_1.default.vehicleStatus.findMany();
        const wheelDrives = await prisma_config_1.default.wheelDrive.findMany();
        const fuelPolicies = await prisma_config_1.default.fuelPolicy.findMany();
        const countries = await prisma_config_1.default.country.findMany();
        const states = await prisma_config_1.default.state.findMany();
        const villages = await prisma_config_1.default.village.findMany();
        const invoiceSequences = await prisma_config_1.default.invoiceSequence.findMany();
        const vehicleModels = await prisma_config_1.default.vehicleModel.findMany();
        const vehicleBrands = await prisma_config_1.default.vehicleBrand.findMany();
        const vehicleBodyTypes = await prisma_config_1.default.vehicleBodyType.findMany();
        const maintenanceServices = await prisma_config_1.default.maintenanceService.findMany();
        const documentTypes = await prisma_config_1.default.documentType.findMany();
        const presetLocations = await prisma_config_1.default.presetLocation.findMany();
        const services = await prisma_config_1.default.service.findMany();
        const licenseClasses = await prisma_config_1.default.licenseClass.findMany();
        const messengerApps = await prisma_config_1.default.messengerApp.findMany();
        const equipments = await prisma_config_1.default.equipment.findMany();
        const subscriptionPlans = await prisma_config_1.default.subscriptionPlan.findMany({
            include: { features: true },
        });
        const contactTypes = await prisma_config_1.default.contactType.findMany();
        const paymentTypes = await prisma_config_1.default.paymentType.findMany();
        const permissions = await prisma_config_1.default.appPermission.findMany();
        res.status(200).json({
            vehicleParts,
            currencies,
            fuelTypes,
            paymentMethods,
            chargeTypes,
            transmissions,
            vehicleFeatures,
            vehicleStatuses,
            wheelDrives,
            fuelPolicies,
            countries,
            states,
            villages,
            invoiceSequences,
            vehicleModels,
            vehicleBrands,
            vehicleBodyTypes,
            maintenanceServices,
            documentTypes,
            presetLocations,
            services,
            licenseClasses,
            messengerApps,
            equipments,
            subscriptionPlans,
            contactTypes,
            paymentTypes,
            permissions,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching admin data');
    }
};
const addVehicleMake = async (req, res) => {
    const { brand } = req.body;
    try {
        const existingMake = await prisma_config_1.default.vehicleBrand.findFirst({
            where: {
                brand: {
                    equals: brand.toLowerCase(),
                    mode: 'insensitive',
                },
            },
        });
        if (existingMake) {
            return res.status(409).json({ message: 'Vehicle make already exists' });
        }
        await prisma_config_1.default.vehicleBrand.create({
            data: {
                brand,
            },
        });
        const vehicleMakes = await prisma_config_1.default.vehicleBrand.findMany();
        res.status(201).json(vehicleMakes);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error adding vehicle make');
    }
};
const addVehicleType = async (req, res) => {
    const { bodyType } = req.body;
    try {
        const existingType = await prisma_config_1.default.vehicleBodyType.findFirst({
            where: {
                bodyType: {
                    equals: bodyType.toLowerCase(),
                    mode: 'insensitive',
                },
            },
        });
        if (existingType) {
            return res.status(409).json({ message: 'Vehicle type already exists' });
        }
        await prisma_config_1.default.vehicleBodyType.create({
            data: {
                bodyType,
            },
        });
        const vehicleTypes = await prisma_config_1.default.vehicleBodyType.findMany();
        res.status(201).json({ ...vehicleTypes });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error adding vehicle type');
    }
};
const addVehicleModel = async (req, res) => {
    const { brandId, model, bodyTypeId } = req.body;
    try {
        const vehicleMake = await prisma_config_1.default.vehicleBrand.findUnique({
            where: { id: brandId },
        });
        if (!vehicleMake) {
            return res.status(404).json({ message: 'Vehicle make not found' });
        }
        await prisma_config_1.default.vehicleModel.create({
            data: {
                brand: { connect: { id: brandId } },
                bodyType: { connect: { id: bodyTypeId } },
                model: model,
            },
        });
        const vehicleModels = await prisma_config_1.default.vehicleModel.findMany();
        res.status(201).json({ ...vehicleModels });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error adding vehicle model');
    }
};
const addVehicleFeature = async (req, res) => {
    const { feature } = req.body;
    try {
        const existingFeature = await prisma_config_1.default.vehicleFeature.findFirst({
            where: {
                feature: {
                    equals: feature.toLowerCase(),
                    mode: 'insensitive',
                },
            },
        });
        if (existingFeature) {
            return res
                .status(409)
                .json({ message: 'Vehicle feature already exists' });
        }
        await prisma_config_1.default.vehicleFeature.create({
            data: {
                feature,
            },
        });
        const vehicleFeatures = await prisma_config_1.default.vehicleFeature.findMany();
        res.status(201).json({ ...vehicleFeatures });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error adding vehicle feature');
    }
};
exports.default = {
    getData,
    addVehicleMake,
    addVehicleType,
    addVehicleModel,
    addVehicleFeature,
};
