"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const email_controller_1 = __importDefault(require("../controllers/email.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const api_middleware_1 = require("../middleware/api.middleware");
const router = express_1.default.Router();
// router.post("/template", controller.setupTemplates);
router.post('/booking/confirm/:bookingId', auth_middleware_1.auth, email_controller_1.default.sendConfirmationEmail);
router.post('/booking/complete', api_middleware_1.api, email_controller_1.default.sendCompletionEmail);
router.put('/template', email_controller_1.default.updateEmailTemplate);
exports.default = router;
