"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const twillio_controller_1 = __importDefault(require("../controllers/twillio.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/whatsapp/notification', auth_middleware_1.auth, twillio_controller_1.default.sendWhatsAppNotification);
router.post('/send-documents', auth_middleware_1.auth, twillio_controller_1.default.sendDocuments);
exports.default = router;
