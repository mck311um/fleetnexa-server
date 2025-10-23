"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const damage_controller_1 = __importDefault(require("./damage.controller"));
const auth_middleware_1 = require("../../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, damage_controller_1.default.getVehicleDamages);
router.post('/', auth_middleware_1.auth, damage_controller_1.default.addVehicleDamage);
router.put('/:id', auth_middleware_1.auth, damage_controller_1.default.updateVehicleDamage);
router.delete('/:id', auth_middleware_1.auth, damage_controller_1.default.deleteVehicleDamage);
exports.default = router;
