"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vehicle_brand_service_1 = require("./vehicle-brand.service");
const logger_1 = require("../../../../config/logger");
const XLSX = __importStar(require("xlsx"));
const validateExcelColumns_1 = require("../../../../utils/validateExcelColumns");
const getVehicleBrands = async (req, res) => {
    try {
        const vehicleBrands = await vehicle_brand_service_1.vehicleBrandService.getAllVehicleBrands();
        res.status(200).json(vehicleBrands);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching vehicle brands');
        res.status(500).json({ error: error.message });
    }
};
const createVehicleBrand = async (req, res) => {
    const data = req.body;
    const validatedBrand = await vehicle_brand_service_1.vehicleBrandService.validateVehicleBrand(data);
    try {
        await vehicle_brand_service_1.vehicleBrandService.createVehicleBrand(validatedBrand);
        const vehicleBrands = await vehicle_brand_service_1.vehicleBrandService.getAllVehicleBrands();
        res
            .status(201)
            .json({ message: 'Vehicle brand created successfully', vehicleBrands });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating vehicle brand');
        res.status(500).json({ error: error.message });
    }
};
const updateVehicleBrand = async (req, res) => {
    const data = req.body;
    const validatedBrand = await vehicle_brand_service_1.vehicleBrandService.validateVehicleBrand(data);
    try {
        await vehicle_brand_service_1.vehicleBrandService.updateVehicleBrand(validatedBrand);
        const vehicleBrands = await vehicle_brand_service_1.vehicleBrandService.getAllVehicleBrands();
        res
            .status(200)
            .json({ message: 'Vehicle brand updated successfully', vehicleBrands });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error updating vehicle brand');
        res.status(500).json({ error: error.message });
    }
};
const deleteVehicleBrand = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Vehicle brand ID is required' });
    }
    try {
        await vehicle_brand_service_1.vehicleBrandService.deleteVehicleBrand(id);
        const vehicleBrands = await vehicle_brand_service_1.vehicleBrandService.getAllVehicleBrands();
        res
            .status(200)
            .json({ message: 'Vehicle brand deleted successfully', vehicleBrands });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error deleting vehicle brand');
        res.status(500).json({ error: error.message });
    }
};
const bulkAddVehicleBrands = async (req, res) => {
    if (!req.file) {
        logger_1.logger.w('No file uploaded for bulk vehicle brand import');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const valid = (0, validateExcelColumns_1.validateExcelColumns)(data, ['brand'], res, logger_1.logger);
        if (!valid)
            return;
        await vehicle_brand_service_1.vehicleBrandService.bulkCreateVehicleBrands(data);
        const vehicleBrands = await vehicle_brand_service_1.vehicleBrandService.getAllVehicleBrands();
        res.status(200).json({
            message: 'Bulk Import successful',
            vehicleBrands,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error during bulk vehicle brand import');
        res.status(500).json({ error: error.message });
    }
};
exports.default = {
    getVehicleBrands,
    createVehicleBrand,
    updateVehicleBrand,
    deleteVehicleBrand,
    bulkAddVehicleBrands,
};
