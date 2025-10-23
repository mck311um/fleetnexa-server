"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expense_controller_1 = __importDefault(require("./expense.controller"));
const auth_middleware_1 = require("../../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, expense_controller_1.default.getExpenses);
router.post('/', auth_middleware_1.auth, expense_controller_1.default.createExpense);
router.put('/', auth_middleware_1.auth, expense_controller_1.default.updateExpense);
router.delete('/:id', auth_middleware_1.auth, expense_controller_1.default.deleteExpense);
exports.default = router;
