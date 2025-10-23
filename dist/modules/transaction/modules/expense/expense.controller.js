"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../config/logger");
const transaction_service_1 = require("../../transaction.service");
const expense_service_1 = require("./expense.service");
const getExpenses = async (req, res) => {
    const { tenant, user } = req.context;
    try {
        const expenses = await expense_service_1.expenseService.getTenantExpenses(tenant);
        res.status(200).json({ expenses });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch expenses', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};
const createExpense = async (req, res) => {
    const { tenant, user } = req.context;
    const data = req.body;
    const expenseDto = await expense_service_1.expenseService.validateExpenseData(data);
    try {
        await expense_service_1.expenseService.createExpense(expenseDto, tenant, user);
        const expenses = await expense_service_1.expenseService.getTenantExpenses(tenant);
        const transactions = await transaction_service_1.transactionService.getTenantTransactions(tenant);
        res.status(201).json({ expenses, transactions });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to create expense', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to create expense' });
    }
};
const updateExpense = async (req, res) => {
    const { tenant, user } = req.context;
    const data = req.body;
    const expenseDto = await expense_service_1.expenseService.validateExpenseData(data);
    try {
        await expense_service_1.expenseService.updateExpense(expenseDto, tenant, user);
        const expenses = await expense_service_1.expenseService.getTenantExpenses(tenant);
        const transactions = await transaction_service_1.transactionService.getTenantTransactions(tenant);
        res.status(200).json({ expenses, transactions });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update expense', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to update expense' });
    }
};
const deleteExpense = async (req, res) => {
    const { tenant, user } = req.context;
    const { id } = req.params;
    try {
        await expense_service_1.expenseService.deleteExpense(id, tenant, user);
        const expenses = await expense_service_1.expenseService.getTenantExpenses(tenant);
        const transactions = await transaction_service_1.transactionService.getTenantTransactions(tenant);
        res.status(200).json({ expenses, transactions });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete expense', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            expenseId: id,
        });
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};
exports.default = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
};
