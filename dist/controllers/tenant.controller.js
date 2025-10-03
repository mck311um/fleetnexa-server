"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_repository_1 = require("../repository/tenant.repository");
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const crypto_1 = __importDefault(require("crypto"));
const generator_service_1 = __importDefault(require("../services/generator.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const ses_service_1 = __importDefault(require("../services/ses.service"));
const logger_1 = require("../config/logger");
const getTenantRentalActivity = async (req, res, next) => {
    const tenantId = req.user?.tenantId;
    try {
        const rentalActivity = await prisma_config_1.default.rentalActivity.findMany({
            where: { tenantId: tenantId },
            include: {
                vehicle: {
                    select: {
                        brand: true,
                        model: true,
                    },
                },
                customer: true,
            },
        });
        res.status(200).json(rentalActivity);
    }
    catch (error) {
        next(error);
    }
};
const createTenant = async (req, res, next) => {
    const { tenantName, email, number, firstName, lastName } = req.body;
    try {
        const success = await prisma_config_1.default.$transaction(async (tx) => {
            const tenantCode = await generator_service_1.default.generateTenantCode(tenantName);
            const slug = await generator_service_1.default.generateTenantSlug(tenantName);
            const newTenant = await tx.tenant.create({
                data: {
                    tenantCode,
                    tenantName,
                    slug,
                    email,
                    number,
                    logo: 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/placeholder_tenant.jpg',
                },
            });
            const userRole = await tx.userRole.create({
                data: {
                    name: 'Admin',
                    description: 'Default role for new tenants',
                    show: true,
                    tenant: { connect: { id: newTenant.id } },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            const superAdminRole = await tx.userRole.create({
                data: {
                    name: 'Super Admin',
                    description: 'Super Admin role for new tenants',
                    show: false,
                    tenant: { connect: { id: newTenant.id } },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            const permissions = await tx.appPermission.findMany({});
            await tx.userRolePermission.createMany({
                data: permissions.map((perm) => ({
                    roleId: userRole.id,
                    permissionId: perm.id,
                    assignedAt: new Date(),
                })),
            });
            await tx.userRolePermission.createMany({
                data: permissions.map((perm) => ({
                    roleId: superAdminRole.id,
                    permissionId: perm.id,
                    assignedAt: new Date(),
                })),
            });
            const salt = await bcrypt_1.default.genSalt(10);
            const password = await generator_service_1.default.generateTempPassword(12);
            const hashedPassword = await bcrypt_1.default.hash(password, salt);
            const username = await generator_service_1.default.generateUserName(firstName, lastName);
            const superAdminPassword = await generator_service_1.default.generateTempPassword(12);
            const superAdminHashedPassword = await bcrypt_1.default.hash(superAdminPassword, salt);
            const user = await tx.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    tenantId: newTenant.id,
                    lastChanged: new Date(),
                    roleId: userRole.id,
                },
            });
            await tx.user.create({
                data: {
                    username: `admin_${tenantCode.toLowerCase()}`,
                    password: superAdminHashedPassword,
                    firstName,
                    lastName,
                    tenantId: newTenant.id,
                    lastChanged: new Date(),
                    roleId: superAdminRole.id,
                    requirePasswordChange: false,
                },
            });
            return { user, tenant: newTenant, password };
        });
        const templateData = {
            name: success.user.firstName + ' ' + success.user.lastName,
            tenantName: success.tenant.tenantName,
            username: success.user.username,
            password: success.password,
        };
        await ses_service_1.default.sendEmail({
            to: [success.tenant.email],
            template: 'WelcomeTemplate',
            templateData,
        });
        res.status(201).json();
    }
    catch (error) {
        next(error);
    }
};
const updateTenant = async (req, res, next) => {
    const body = req.body;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            await prisma_config_1.default.address.upsert({
                where: { tenantId: tenantId },
                update: {
                    street: body.address.street,
                    village: { connect: { id: body.address.villageId } },
                    state: { connect: { id: body.address.stateId } },
                    country: { connect: { id: body.address.countryId } },
                },
                create: {
                    tenant: { connect: { id: tenantId } },
                    street: body.address.street,
                    village: { connect: { id: body.address.villageId } },
                    state: { connect: { id: body.address.stateId } },
                    country: { connect: { id: body.address.countryId } },
                },
            });
            await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    currencyId: body.currencyId,
                    email: body.email,
                    invoiceFootNotes: body.invoiceFootNotes,
                    invoiceSequenceId: body.invoiceSequenceId,
                    logo: body.logo,
                    number: body.number,
                    tenantName: body.tenantName,
                    financialYearStart: body.financialYearStart,
                    setupCompleted: true,
                    securityDeposit: body.securityDeposit,
                    additionalDriverFee: body.additionalDriverFee,
                    daysInMonth: body.daysInMonth,
                    description: body.description,
                    paymentMethods: {
                        set: body.paymentMethods.map((method) => ({ id: method.id })),
                    },
                },
            });
            await tx.cancellationPolicy.upsert({
                where: {
                    tenantId: tenantId,
                },
                update: {
                    amount: parseInt(body.cancellationPolicy?.amount) || 0,
                    policy: body.cancellationPolicy?.policy || 'fixed_amount',
                    minimumDays: parseInt(body.cancellationPolicy?.minimumDays) || 0,
                },
                create: {
                    tenantId: tenantId,
                    tenant: { connect: { id: tenantId } },
                    amount: parseInt(body.cancellationPolicy?.amount) || 0,
                    policy: body.cancellationPolicy?.policy || 'fixed_amount',
                    minimumDays: parseInt(body.cancellationPolicy?.minimumDays) || 0,
                    bookingMinimumDays: parseInt(body.cancellationPolicy?.bookingMinimumDays) || 0,
                },
            });
            await tx.latePolicy.upsert({
                where: {
                    tenantId: tenantId,
                },
                update: {
                    amount: body.latePolicy?.amount || 0,
                    maxHours: body.latePolicy?.maxHours || 0,
                },
                create: {
                    tenantId: tenantId,
                    tenant: { connect: { id: tenantId } },
                    amount: body.latePolicy?.amount || 0,
                    maxHours: body.latePolicy?.maxHours || 0,
                },
            });
            const currencyRates = await tx.tenantCurrencyRate.findMany({
                where: { tenantId: tenantId },
            });
            if (currencyRates.length <= 0) {
                const currencies = await tx.currency.findMany({});
                for (const currency of currencies) {
                    if (currency.id === body.currencyId) {
                        await tx.tenantCurrencyRate.create({
                            data: {
                                id: crypto_1.default.randomUUID(),
                                tenantId: tenantId,
                                currencyId: currency.id,
                                enabled: true,
                                fromRate: 1,
                                toRate: 1,
                                createdAt: new Date(),
                            },
                        });
                    }
                    else {
                        await tx.tenantCurrencyRate.create({
                            data: {
                                id: crypto_1.default.randomUUID(),
                                tenantId: tenantId,
                                currencyId: currency.id,
                                enabled: false,
                                fromRate: 0.0,
                                toRate: 0.0,
                                createdAt: new Date(),
                            },
                        });
                    }
                }
            }
        });
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        res.json(tenant);
    }
    catch (error) {
        next(error);
    }
};
// #region User Roles
const getTenantRoles = async (req, res) => {
    const tenantId = req.user?.tenantId;
    try {
        const roles = await prisma_config_1.default.userRole.findMany({
            where: { tenantId, isDeleted: false, show: true },
            include: {
                rolePermission: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        res.status(200).json(roles);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tenant roles' });
    }
};
const getTenantRolesById = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    try {
        const role = await prisma_config_1.default.userRole.findUnique({
            where: { id, tenantId, show: true, isDeleted: false },
            include: {
                rolePermission: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json(role);
    }
    catch (error) {
        next(error);
    }
};
const assignPermissionsToRole = async (req, res, next) => {
    const { roleId, permissions } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        const role = await prisma_config_1.default.userRole.findUnique({
            where: { id: roleId, tenantId },
        });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        await prisma_config_1.default.userRolePermission.deleteMany({
            where: { roleId: role.id },
        });
        await prisma_config_1.default.userRolePermission.createMany({
            data: permissions.map((perm) => ({
                roleId,
                permissionId: perm.id,
                assignedBy: userId,
                assignedAt: new Date(),
            })),
        });
        const updatedRoles = await prisma_config_1.default.userRole.findMany({
            where: { tenantId },
            include: {
                rolePermission: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        res.status(200).json(updatedRoles);
    }
    catch (error) {
        next(error);
    }
};
const addTenantRole = async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.userRole.create({
            data: {
                name,
                description,
                tenantId: tenantId,
                updatedBy: userId,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        const roles = await prisma_config_1.default.userRole.findMany({
            where: { tenantId, isDeleted: false },
            include: {
                rolePermission: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        res.status(201).json(roles);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating tenant role' });
    }
};
const updateTenantRole = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.userRole.update({
            where: { id },
            data: {
                name,
                description,
                updatedBy: userId,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        const roles = await prisma_config_1.default.userRole.findMany({
            where: { tenantId, isDeleted: false },
            include: {
                rolePermission: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        res.status(201).json(roles);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating tenant role' });
    }
};
// #endregion
// #region Tenant Reminders
const getTenantReminders = async (req, res, next) => {
    const tenantId = req.user?.tenantId;
    try {
        const reminders = await prisma_config_1.default.tenantReminders.findMany({
            where: { tenantId: tenantId },
        });
        res.status(200).json(reminders);
    }
    catch (error) {
        next(error);
    }
};
const addTenantReminder = async (req, res) => {
    const tenantId = req.user?.tenantId;
    try {
        // const newReminder = await prisma.tenantReminders.create({
        //   data: {
        //     reminder,
        //     date: new Date(date),
        //     tenantId: tenantId!,
        //     updatedBy: userId,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        //   },
        // });
        const reminders = await prisma_config_1.default.tenantReminders.findMany({
            where: { tenantId: tenantId },
            orderBy: { date: 'asc' },
        });
        res.status(201).json(reminders);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error adding tenant reminder');
    }
};
const updateTenantReminder = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        const existingReminder = await prisma_config_1.default.tenantReminders.findUnique({
            where: { id },
        });
        await prisma_config_1.default.tenantReminders.update({
            where: { id },
            data: {
                completed: !existingReminder?.completed,
                completedAt: new Date(),
                updatedBy: userId,
                updatedAt: new Date(),
            },
        });
        const reminders = await prisma_config_1.default.tenantReminders.findMany({
            where: { tenantId: tenantId },
            orderBy: { date: 'asc' },
        });
        res.status(200).json(reminders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating tenant reminder' });
    }
};
// #endregion
// #region Tenant Notifications
const getTenantNotifications = async (req, res, next) => {
    const tenantId = req.user?.tenantId;
    try {
        const notifications = await prisma_config_1.default.tenantNotification.findMany({
            where: { tenantId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
const markNotificationAsRead = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    try {
        const notification = await prisma_config_1.default.tenantNotification.findUnique({
            where: { id, tenantId },
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        await prisma_config_1.default.tenantNotification.update({
            where: { id },
            data: { read: true },
        });
        const notifications = await prisma_config_1.default.tenantNotification.findMany({
            where: { tenantId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
const markAllNotificationsAsRead = async (req, res, next) => {
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.tenantNotification.updateMany({
            where: { tenantId, read: false, isDeleted: false },
            data: { read: true },
        });
        const notifications = await prisma_config_1.default.tenantNotification.findMany({
            where: { tenantId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
const deleteNotification = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    try {
        const notification = await prisma_config_1.default.tenantNotification.findUnique({
            where: { id, tenantId },
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        await prisma_config_1.default.tenantNotification.update({
            where: { id },
            data: { isDeleted: true },
        });
        const notifications = await prisma_config_1.default.tenantNotification.findMany({
            where: { tenantId, isDeleted: false },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
//#endregion
exports.default = {
    createTenant,
    updateTenant,
    getTenantRentalActivity,
    getTenantReminders,
    getTenantRoles,
    getTenantRolesById,
    assignPermissionsToRole,
    addTenantRole,
    updateTenantRole,
    addTenantReminder,
    updateTenantReminder,
    getTenantNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
