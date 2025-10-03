"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenant_violation_controller_1 = __importDefault(require("./tenant-violation.controller"));
const auth_middleware_1 = require("../../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, tenant_violation_controller_1.default.getAllTenantViolations);
router.post('/', auth_middleware_1.auth, tenant_violation_controller_1.default.createViolation);
router.put('/', auth_middleware_1.auth, tenant_violation_controller_1.default.updateViolation);
router.delete('/:id', auth_middleware_1.auth, tenant_violation_controller_1.default.deleteViolation);
exports.default = router;
