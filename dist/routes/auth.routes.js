"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const router = express_1.default.Router();
router.post('/register', auth_controller_1.default.register);
router.post('/register/storefront', auth_controller_1.default.storefrontRegister);
router.post('/login/storefront', auth_controller_1.default.storefrontLogin);
exports.default = router;
