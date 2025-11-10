"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_controller_1 = __importDefault(require("./storage.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const api_middleware_1 = require("../../middleware/api.middleware");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.auth, storage_controller_1.default.uploadFile);
router.post('/storefront', api_middleware_1.api, storage_controller_1.default.uploadFile);
router.post('/multiple', auth_middleware_1.auth, storage_controller_1.default.uploadMultipleFiles);
exports.default = router;
