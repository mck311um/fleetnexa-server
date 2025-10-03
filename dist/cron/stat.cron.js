"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMonthlyStatCron = exports.runYearlyStatCron = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const node_cron_1 = __importDefault(require("node-cron"));
const prisma = new client_1.PrismaClient();
const runYearlyStatCron = async () => {
    const tenants = await prisma.tenant.findMany();
    const now = new Date();
    const years = [(0, date_fns_1.getYear)(now), (0, date_fns_1.getYear)(now) - 1];
    for (const tenant of tenants) {
        for (const year of years) {
            const from = (0, date_fns_1.startOfYear)(new Date(year, 0, 1));
            const to = (0, date_fns_1.endOfYear)(new Date(year, 0, 1));
            await Promise.all([
                saveYearlyStat(tenant.id, year, 'YEARLY_REVENUE', await calcYearlyRevenue(tenant.id, from, to), from, to),
                saveYearlyStat(tenant.id, year, 'YEARLY_RENTALS', await calcYearlyRentals(tenant.id, from, to), from, to),
                saveYearlyStat(tenant.id, year, 'YEARLY_CUSTOMERS', await calcYearlyCustomers(tenant.id, from, to), from, to),
                saveYearlyStat(tenant.id, year, 'AVERAGE_RENTAL_DURATION', await calcAverageRentalDuration(tenant.id, from, to), from, to),
            ]);
        }
    }
};
exports.runYearlyStatCron = runYearlyStatCron;
const saveYearlyStat = async (tenantId, year, stat, value, from, to) => {
    await prisma.tenantYearlyStats.upsert({
        where: {
            tenantId_year_stat: {
                tenantId,
                year,
                stat,
            },
        },
        update: { value: value ?? 0 },
        create: {
            tenantId,
            year,
            stat,
            value: value ?? 0,
            startDate: from,
            endDate: to,
        },
    });
};
const calcYearlyRevenue = async (tenantId, from, to) => {
    const { _sum } = await prisma.transactions.aggregate({
        where: {
            rental: {
                tenantId,
                startDate: { gte: from, lte: to },
                status: 'COMPLETED',
            },
            isDeleted: false,
        },
        _sum: { amount: true },
    });
    return _sum.amount ?? 0;
};
const calcYearlyRentals = async (tenantId, from, to) => {
    return await prisma.rental.count({
        where: {
            tenantId,
            startDate: { gte: from, lte: to },
            status: 'COMPLETED',
            isDeleted: false,
        },
    });
};
const calcYearlyCustomers = async (tenantId, from, to) => {
    return await prisma.customer.count({
        where: {
            tenantId,
            createdAt: { gte: from, lte: to },
            isDeleted: false,
        },
    });
};
const calcAverageRentalDuration = async (tenantId, from, to) => {
    const rentals = await prisma.rental.findMany({
        where: {
            tenantId,
            startDate: { gte: from },
            endDate: { lte: to },
            status: 'COMPLETED',
            isDeleted: false,
        },
        select: {
            startDate: true,
            endDate: true,
        },
    });
    if (rentals.length === 0)
        return 0;
    const totalDays = rentals.reduce((acc, rental) => {
        const diff = Math.ceil((rental.endDate.getTime() - rental.startDate.getTime()) /
            (1000 * 60 * 60 * 24));
        return acc + diff;
    }, 0);
    return parseFloat((totalDays / rentals.length).toFixed(2));
};
const runMonthlyStatCron = async () => {
    const tenants = await prisma.tenant.findMany();
    const now = new Date();
    const currentYear = (0, date_fns_1.getYear)(now);
    for (const tenant of tenants) {
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        const monthsInYear = (0, date_fns_1.eachMonthOfInterval)({
            start: yearStart,
            end: yearEnd,
        });
        for (const monthDate of monthsInYear) {
            const month = (0, date_fns_1.getMonth)(monthDate) + 1;
            const year = (0, date_fns_1.getYear)(monthDate);
            const from = (0, date_fns_1.startOfMonth)(monthDate);
            const to = (0, date_fns_1.endOfMonth)(monthDate);
            await Promise.all([
                saveMonthlyStat(tenant.id, month, year, 'MONTHLY_EARNINGS', await calcMonthlyEarnings(tenant.id, from, to), to, from),
                saveMonthlyStat(tenant.id, month, year, 'MONTHLY_RENTALS', await calcMonthlyRentals(tenant.id, from, to), to, from),
                calcMonthlyRentalStatus(tenant.id, from, to),
            ]);
        }
    }
};
exports.runMonthlyStatCron = runMonthlyStatCron;
const saveMonthlyStat = async (tenantId, month, year, stat, value, from, to) => {
    await prisma.tenantMonthlyStats.upsert({
        where: {
            tenantId_month_year_stat: {
                tenantId,
                month,
                year,
                stat,
            },
        },
        update: { value: value ?? 0 },
        create: {
            tenantId,
            month,
            year,
            stat,
            value: value ?? 0,
            startDate: from,
            endDate: to,
        },
    });
};
const calcMonthlyEarnings = async (tenantId, from, to) => {
    const { _sum } = await prisma.transactions.aggregate({
        where: {
            rental: {
                tenantId,
                startDate: { gte: from, lte: to },
                status: 'COMPLETED',
                isDeleted: false,
            },
        },
        _sum: { amount: true },
    });
    return _sum.amount ?? 0;
};
const calcMonthlyRentals = async (tenantId, from, to) => {
    return await prisma.rental.count({
        where: {
            tenantId,
            startDate: { gte: from, lte: to },
            status: 'COMPLETED',
            isDeleted: false,
        },
    });
};
const calcMonthlyRentalStatus = async (tenantId, from, to) => {
    const statuses = [
        'ACTIVE',
        'COMPLETED',
        'DECLINED',
        'CANCELED',
        'REFUNDED',
        'CONFIRMED',
    ];
    for (const status of statuses) {
        const count = await prisma.rental.count({
            where: {
                tenantId,
                createdAt: { gte: from, lte: to },
                status: status,
                isDeleted: false,
            },
        });
        await saveMonthlyRentalStatus(tenantId, (0, date_fns_1.getMonth)(from) + 1, (0, date_fns_1.getYear)(from), 'MONTHLY_RENTAL_STATUS', status, count, from, to);
    }
};
const saveMonthlyRentalStatus = async (tenantId, month, year, stat, status, value, from, to) => {
    await prisma.tenantMonthlyRentalStats.upsert({
        where: {
            tenantId_status_month_year_stat: {
                tenantId,
                status,
                month,
                year,
                stat,
            },
        },
        update: { value: value ?? 0 },
        create: {
            tenantId,
            month,
            year,
            stat,
            status,
            value: value ?? 0,
            startDate: from,
            endDate: to,
        },
    });
};
node_cron_1.default.schedule('*/30 * * * *', async () => {
    try {
        console.log('Running stats cron job...');
        await (0, exports.runMonthlyStatCron)();
        await (0, exports.runYearlyStatCron)();
    }
    catch (error) {
        console.error('Error running stats cron job:', error);
    }
    finally {
        console.log('Stats cron job completed.');
    }
});
