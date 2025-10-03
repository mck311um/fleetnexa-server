"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = __importDefault(require("../controllers/admin.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', admin_controller_1.default.getData);
router.post('/vehicle-make', auth_middleware_1.auth, admin_controller_1.default.addVehicleMake);
router.post('/vehicle-model', auth_middleware_1.auth, admin_controller_1.default.addVehicleModel);
router.post('/vehicle-type', auth_middleware_1.auth, admin_controller_1.default.addVehicleType);
router.post('/vehicle-feature', auth_middleware_1.auth, admin_controller_1.default.addVehicleFeature);
exports.default = router;
