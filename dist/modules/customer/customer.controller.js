"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const tenant_repository_1 = require("../../repository/tenant.repository");
const customer_service_1 = require("./customer.service");
const getCustomers = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing');
        return res.status(400).json({ message: 'Tenant ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantCode, tenantId });
            return res.status(404).json({ message: 'Tenant not found' });
        }
        const customers = await customer_service_1.customerService.getTenantCustomers(tenant);
        return res.status(200).json(customers);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch customers', {
            tenantId,
            tenantCode,
        });
        return res.status(500).json({ message: 'Failed to fetch customers' });
    }
};
const getCustomerById = async (req, res) => {
    const { id } = req.params;
    const { tenant } = req.context;
    try {
        const customer = await customer_service_1.customerService.getCustomerById(id, tenant);
        return res.status(200).json(customer);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get customer by ID', {
            customerId: id,
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: error.message || 'Failed to get customer by ID' });
    }
};
const createCustomer = async (req, res) => {
    const body = req.body;
    const { tenant, user } = req.context;
    const customerDto = await customer_service_1.customerService.validateCustomerData(body);
    try {
        const customer = await customer_service_1.customerService.createCustomer(customerDto, tenant, user);
        const customers = await customer_service_1.customerService.getTenantCustomers(tenant);
        return res
            .status(201)
            .json({ message: 'Customer created successfully', customer, customers });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to create customer', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res
            .status(500)
            .json({ message: error.message || 'Failed to create customer' });
    }
};
const updateCustomer = async (req, res) => {
    const body = req.body;
    const { tenant, user } = req.context;
    const customerDto = await customer_service_1.customerService.validateCustomerData(body);
    try {
        const customer = await customer_service_1.customerService.updateCustomer(customerDto, tenant, user);
        const customers = await customer_service_1.customerService.getTenantCustomers(tenant);
        return res.status(200).json({
            message: 'Customer updated successfully',
            customer,
            customers,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update customer', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            userId: user.id,
        });
        return res
            .status(500)
            .json({ message: error.message || 'Failed to update customer' });
    }
};
const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    const { tenant, user } = req.context;
    try {
        await customer_service_1.customerService.deleteCustomer(id, tenant, user);
        const customers = await customer_service_1.customerService.getTenantCustomers(tenant);
        return res
            .status(200)
            .json({ message: 'Customer deleted successfully', customers });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete customer', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            userId: user.id,
        });
        return res
            .status(500)
            .json({ message: error.message || 'Failed to delete customer' });
    }
};
exports.default = {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
};
