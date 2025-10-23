"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = __importDefault(require("../controllers/customer.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/:id', auth_middleware_1.auth, customer_controller_1.default.getCustomerById);
router.post('/', auth_middleware_1.auth, customer_controller_1.default.addCustomer);
router.post('/document', auth_middleware_1.auth, customer_controller_1.default.addCustomerDocument);
router.put('/', auth_middleware_1.auth, customer_controller_1.default.updateCustomer);
router.delete('/:id', auth_middleware_1.auth, customer_controller_1.default.deleteCustomer);
exports.default = router;
