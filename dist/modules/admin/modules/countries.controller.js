"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countriesController = void 0;
const prisma_config_1 = __importDefault(require("../../../config/prisma.config"));
const logger_1 = require("../../../config/logger");
const getCountries = async (req, res) => {
    try {
        const countries = await prisma_config_1.default.country.findMany();
        res.status(200).json(countries);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching countries');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.countriesController = {
    getCountries,
};
