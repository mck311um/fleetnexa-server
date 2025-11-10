"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../../../../config/logger");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const expense_dto_1 = require("./expense.dto");
const transaction_service_1 = require("../../transaction.service");
const uuid_1 = require("uuid");
class ExpenseService {
    async validateExpenseData(data) {
        const safeParse = expense_dto_1.ExpenseSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.e(safeParse.error, 'Invalid expense data', data);
            throw new Error('Invalid expense data');
        }
        return safeParse.data;
    }
    async getTenantExpenses(tenant) {
        try {
            const expenses = await prisma_config_1.default.expense.findMany({
                where: { tenantId: tenant.id, isDeleted: false },
                include: {
                    vendor: true,
                    vehicle: true,
                },
            });
            return expenses;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching tenant expenses', {
                tenantId: tenant.id,
            });
            throw new Error('Could not fetch tenant expenses');
        }
    }
    async createExpense(data, tenant, user) {
        try {
            await prisma_config_1.default.expense.create({
                data: {
                    id: data.id,
                    amount: data.amount,
                    expenseDate: data.expenseDate,
                    notes: data.notes,
                    vendorId: data.vendorId,
                    vehicleId: data.vehicleId,
                    tenantId: tenant.id,
                    maintenanceId: data.maintenanceId,
                    createdBy: user.username,
                    expense: data.expense,
                    payee: data.payee,
                },
            });
            const transaction = {
                id: (0, uuid_1.v4)(),
                amount: data.amount,
                type: client_1.TransactionType.EXPENSE,
                transactionDate: data.expenseDate,
                expenseId: data.id,
            };
            await transaction_service_1.transactionService.createTransaction(transaction, tenant, user);
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to create expense', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                amount: data.amount,
            });
            throw error;
        }
    }
    async updateExpense(data, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                const existingExpense = await tx.expense.findUnique({
                    where: { id: data.id },
                });
                if (!existingExpense) {
                    throw new Error('Expense not found');
                }
                await tx.expense.update({
                    where: { id: data.id },
                    data: {
                        amount: data.amount,
                        expenseDate: data.expenseDate,
                        notes: data.notes,
                        vendorId: data.vendorId,
                        payee: data.payee,
                        expense: data.expense,
                        maintenanceId: data.maintenanceId,
                        vehicleId: data.vehicleId,
                        updatedAt: new Date(),
                    },
                });
                const existingTransaction = await tx.transactions.findFirst({
                    where: { expenseId: data.id },
                });
                if (!existingTransaction) {
                    throw new Error('Associated transaction not found');
                }
                const transaction = {
                    id: existingTransaction.id,
                    amount: data.amount,
                    transactionDate: data.expenseDate,
                    type: client_1.TransactionType.EXPENSE,
                };
                await transaction_service_1.transactionService.updateTransaction(transaction, tenant, user);
                await tx.transactions.update({
                    where: { id: existingTransaction.id },
                    data: {
                        amount: data.amount,
                        transactionDate: data.expenseDate,
                        updatedAt: new Date(),
                        updatedBy: user.username,
                    },
                });
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to update expense', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                amount: data.amount,
            });
            throw error;
        }
    }
    async deleteExpense(expenseId, tenant, user) {
        try {
            const existingExpense = await prisma_config_1.default.expense.findUnique({
                where: { id: expenseId },
            });
            if (!existingExpense) {
                throw new Error('Expense not found');
            }
            const existingTransaction = await prisma_config_1.default.transactions.findFirst({
                where: { expenseId: expenseId },
            });
            if (!existingTransaction) {
                throw new Error('Associated transaction not found');
            }
            await prisma_config_1.default.expense.update({
                where: { id: expenseId },
                data: {
                    isDeleted: true,
                    updatedAt: new Date(),
                },
            });
            await transaction_service_1.transactionService.deleteTransaction(existingTransaction.id, tenant, user);
        }
        catch (error) {
            logger_1.logger.e(error, 'Error deleting expense', {
                user: user.username,
                tenant: tenant.id,
                tenantCode: tenant.tenantCode,
                expenseId: expenseId,
            });
            throw error;
        }
    }
}
exports.expenseService = new ExpenseService();
