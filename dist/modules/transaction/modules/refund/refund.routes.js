"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const refund_controller_1 = __importDefault(require("./refund.controller"));
const auth_middleware_1 = require("../../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, refund_controller_1.default.getRefunds);
router.post('/', auth_middleware_1.auth, refund_controller_1.default.createRefund);
router.put('/', auth_middleware_1.auth, refund_controller_1.default.updateRefund);
router.delete('/:id', auth_middleware_1.auth, refund_controller_1.default.deleteRefund);
exports.default = router;
