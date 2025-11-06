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
const XLSX = __importStar(require("xlsx"));
const body_type_service_1 = require("./body-type.service");
const logger_1 = require("../../../../config/logger");
const validateExcelColumns_1 = require("../../../../utils/validateExcelColumns");
const getVehicleBodyTypes = async (req, res) => {
    try {
        const vehicleBodyTypes = await body_type_service_1.bodyTypeService.getAllVehicleBodyTypes();
        res.status(200).json(vehicleBodyTypes);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching vehicle body types');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const createVehicleBodyType = async (req, res) => {
    const data = req.body;
    const validatedBodyType = await body_type_service_1.bodyTypeService.validateBodyType(data);
    try {
        await body_type_service_1.bodyTypeService.createVehicleBodyType(validatedBodyType);
        const bodyTypes = await body_type_service_1.bodyTypeService.getAllVehicleBodyTypes();
        res
            .status(201)
            .json({ message: 'Vehicle body type created successfully', bodyTypes });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating vehicle body type');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const updateVehicleBodyType = async (req, res) => {
    const data = req.body;
    const validatedBodyType = await body_type_service_1.bodyTypeService.validateBodyType(data);
    try {
        await body_type_service_1.bodyTypeService.updateVehicleBodyType(validatedBodyType);
        const bodyTypes = await body_type_service_1.bodyTypeService.getAllVehicleBodyTypes();
        res
            .status(200)
            .json({ message: 'Vehicle body type updated successfully', bodyTypes });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error updating vehicle body type');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const deleteVehicleBodyType = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Body type ID is required' });
    }
    try {
        await body_type_service_1.bodyTypeService.deleteVehicleBodyType(id);
        const vehicleBodyTypes = await body_type_service_1.bodyTypeService.getAllVehicleBodyTypes();
        res.status(200).json({
            message: 'Vehicle body type deleted successfully',
            vehicleBodyTypes,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error deleting vehicle body type');
        res.status(500).json({ error: error.message });
    }
};
const bulkInsertVehicleBodyTypes = async (req, res) => {
    if (!req.file) {
        logger_1.logger.w('No file');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const valid = (0, validateExcelColumns_1.validateExcelColumns)(data, ['bodyType'], res, logger_1.logger);
        if (!valid)
            return;
        await body_type_service_1.bodyTypeService.bulkCreateVehicleBodyTypes(data);
        const vehicleBodyTypes = await body_type_service_1.bodyTypeService.getAllVehicleBodyTypes();
        res.status(200).json({
            message: 'Bulk Import successful',
            vehicleBodyTypes,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error during bulk vehicle body type import');
        res.status(500).json({ error });
    }
};
exports.default = {
    getVehicleBodyTypes,
    createVehicleBodyType,
    updateVehicleBodyType,
    deleteVehicleBodyType,
    bulkInsertVehicleBodyTypes,
};
