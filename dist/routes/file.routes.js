"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const file_controller_1 = __importDefault(require("../controllers/file.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/upload', auth_middleware_1.auth, file_controller_1.default.uploadFile);
router.get('/getUrl', auth_middleware_1.auth, file_controller_1.default.getFileUrl);
router.delete('/:key', auth_middleware_1.auth, file_controller_1.default.deleteFile);
exports.default = router;
