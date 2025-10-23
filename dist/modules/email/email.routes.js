"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const email_controller_1 = __importDefault(require("./email.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', email_controller_1.default.setupTemplates);
router.post('/booking/documents', auth_middleware_1.auth, email_controller_1.default.sendBookingDocumentsEmail);
// router.post("/booking/confirm/:id", auth, controller.sendConfirmationEmail);
exports.default = router;
