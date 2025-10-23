"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_role_controller_1 = __importDefault(require("./user-role.controller"));
const auth_middleware_1 = require("../../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, user_role_controller_1.default.getUserRole);
router.get('/roles', auth_middleware_1.auth, user_role_controller_1.default.getRoles);
router.post('/', auth_middleware_1.auth, user_role_controller_1.default.addUserRole);
router.put('/assign/:id', auth_middleware_1.auth, user_role_controller_1.default.assignPermissions);
router.put('/', auth_middleware_1.auth, user_role_controller_1.default.updateRole);
router.delete('/:id', auth_middleware_1.auth, user_role_controller_1.default.deleteRole);
exports.default = router;
