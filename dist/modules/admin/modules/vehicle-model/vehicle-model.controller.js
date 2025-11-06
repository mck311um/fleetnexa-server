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
const vehicle_model_service_1 = require("./vehicle-model.service");
const logger_1 = require("../../../../config/logger");
const XLSX = __importStar(require("xlsx"));
const validateExcelColumns_1 = require("../../../../utils/validateExcelColumns");
const getVehicleModels = async (req, res) => {
    try {
        const vehicleModels = await vehicle_model_service_1.vehicleModelService.getAllVehicleModels();
        res.status(200).json(vehicleModels);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching vehicle models');
        res.status(500).json({ error });
    }
};
const createVehicleModel = async (req, res) => {
    const data = req.body;
    const validatedData = await vehicle_model_service_1.vehicleModelService.validateVehicleModel(data);
    try {
        await vehicle_model_service_1.vehicleModelService.createVehicleModel(validatedData);
        const vehicleModels = await vehicle_model_service_1.vehicleModelService.getAllVehicleModels();
        res
            .status(201)
            .json({ message: 'Vehicle model created successfully', vehicleModels });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating vehicle model');
        res.status(500).json({ error });
    }
};
const updateVehicleModel = async (req, res) => {
    const data = req.body;
    const validatedData = await vehicle_model_service_1.vehicleModelService.validateVehicleModel(data);
    try {
        await vehicle_model_service_1.vehicleModelService.updateVehicleModel(validatedData);
        const vehicleModels = await vehicle_model_service_1.vehicleModelService.getAllVehicleModels();
        res
            .status(200)
            .json({ message: 'Vehicle model updated successfully', vehicleModels });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error updating vehicle model');
        res.status(500).json({ error });
    }
};
const deleteVehicleModel = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Model ID is required' });
    }
    try {
        await vehicle_model_service_1.vehicleModelService.deleteVehicleModel(id);
        const vehicleModels = await vehicle_model_service_1.vehicleModelService.getAllVehicleModels();
        res
            .status(200)
            .json({ message: 'Vehicle model deleted successfully', vehicleModels });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error deleting vehicle model');
        res.status(500).json({ message: error.message });
    }
};
const bulkInsertVehicleModels = async (req, res) => {
    if (!req.file) {
        logger_1.logger.w('No file uploaded for bulk vehicle model import');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const valid = (0, validateExcelColumns_1.validateExcelColumns)(data, ['model', 'bodyType', 'brand'], res, logger_1.logger);
        if (!valid)
            return;
        await vehicle_model_service_1.vehicleModelService.bulkCreateVehicleModels(data);
        const vehicleModels = await vehicle_model_service_1.vehicleModelService.getAllVehicleModels();
        res.status(200).json({
            message: 'Bulk vehicle model import successful',
            vehicleModels,
        });
    }
    catch (error) {
        logger_1.logger.e(error, `Error occurred during bulk vehicle model import`);
        return res.status(500).json({ error });
    }
};
exports.default = {
    getVehicleModels,
    createVehicleModel,
    updateVehicleModel,
    deleteVehicleModel,
    bulkInsertVehicleModels,
};
