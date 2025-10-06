"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = __importDefault(require("./admin.controller"));
const countries_controller_1 = require("./modules/countries.controller");
const admin_middleware_1 = require("../../middleware/admin.middleware");
const router = express_1.default.Router();
router.get('/', admin_controller_1.default.getAdminData);
router.get('/countries', admin_middleware_1.admin, countries_controller_1.countriesController.getCountries);
exports.default = router;
