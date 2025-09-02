import { PrismaClient } from "@prisma/client";
import {
  getYear,
  eachMonthOfInterval,
  getMonth,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import cron from "node-cron";

const prisma = new PrismaClient();

export const runYearlyStatCron = async () => {
  const tenants = await prisma.tenant.findMany();
  const now = new Date();
  const years = [getYear(now), getYear(now) - 1];

  for (const tenant of tenants) {
    for (const year of years) {
      const from = startOfYear(new Date(year, 0, 1));
      const to = endOfYear(new Date(year, 0, 1));

      await Promise.all([
        saveYearlyStat(
          tenant.id,
          year,
          "YEARLY_REVENUE",
          await calcYearlyRevenue(tenant.id, from, to),
          from,
          to
        ),
        saveYearlyStat(
          tenant.id,
          year,
          "YEARLY_RENTALS",
          await calcYearlyRentals(tenant.id, from, to),
          from,
          to
        ),
        saveYearlyStat(
          tenant.id,
          year,
          "YEARLY_CUSTOMERS",
          await calcYearlyCustomers(tenant.id, from, to),
          from,
          to
        ),
        saveYearlyStat(
          tenant.id,
          year,
          "AVERAGE_RENTAL_DURATION",
          await calcAverageRentalDuration(tenant.id, from, to),
          from,
          to
        ),
      ]);
    }
  }
};

const saveYearlyStat = async (
  tenantId: string,
  year: number,
  stat:
    | "YEARLY_REVENUE"
    | "YEARLY_RENTALS"
    | "YEARLY_CUSTOMERS"
    | "AVERAGE_RENTAL_DURATION",
  value: number,
  from: Date,
  to: Date
) => {
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

const calcYearlyRevenue = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  const { _sum } = await prisma.transactions.aggregate({
    where: {
      rental: {
        tenantId,
        startDate: { gte: from, lte: to },
        status: "COMPLETED",
      },
      isDeleted: false,
    },
    _sum: { amount: true },
  });

  return _sum.amount ?? 0;
};

const calcYearlyRentals = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  return await prisma.rental.count({
    where: {
      tenantId,
      startDate: { gte: from, lte: to },
      status: "COMPLETED",
      isDeleted: false,
    },
  });
};

const calcYearlyCustomers = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  return await prisma.customer.count({
    where: {
      tenantId,
      createdAt: { gte: from, lte: to },
      isDeleted: false,
    },
  });
};

const calcAverageRentalDuration = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  const rentals = await prisma.rental.findMany({
    where: {
      tenantId,
      startDate: { gte: from },
      endDate: { lte: to },
      status: "COMPLETED",
      isDeleted: false,
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  if (rentals.length === 0) return 0;

  const totalDays = rentals.reduce((acc, rental) => {
    const diff = Math.ceil(
      (rental.endDate.getTime() - rental.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return acc + diff;
  }, 0);

  return parseFloat((totalDays / rentals.length).toFixed(2));
};

export const runMonthlyStatCron = async () => {
  const tenants = await prisma.tenant.findMany();
  const now = new Date();
  const currentYear = getYear(now);

  for (const tenant of tenants) {
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    const monthsInYear = eachMonthOfInterval({
      start: yearStart,
      end: yearEnd,
    });

    for (const monthDate of monthsInYear) {
      const month = getMonth(monthDate) + 1;
      const year = getYear(monthDate);
      const from = startOfMonth(monthDate);
      const to = endOfMonth(monthDate);

      await Promise.all([
        saveMonthlyStat(
          tenant.id,
          month,
          year,
          "MONTHLY_EARNINGS",
          await calcMonthlyEarnings(tenant.id, from, to),
          to,
          from
        ),
        saveMonthlyStat(
          tenant.id,
          month,
          year,
          "MONTHLY_RENTALS",
          await calcMonthlyRentals(tenant.id, from, to),
          to,
          from
        ),
        calcMonthlyRentalStatus(tenant.id, from, to),
      ]);
    }
  }
};

const saveMonthlyStat = async (
  tenantId: string,
  month: number,
  year: number,
  stat: "MONTHLY_EARNINGS" | "MONTHLY_RENTALS" | "MONTHLY_RENTAL_STATUS",
  value: number,
  from: Date,
  to: Date
) => {
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

const calcMonthlyEarnings = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  const { _sum } = await prisma.transactions.aggregate({
    where: {
      rental: {
        tenantId,
        startDate: { gte: from, lte: to },
        status: "COMPLETED",
        isDeleted: false,
      },
    },
    _sum: { amount: true },
  });

  return _sum.amount ?? 0;
};

const calcMonthlyRentals = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  return await prisma.rental.count({
    where: {
      tenantId,
      startDate: { gte: from, lte: to },
      status: "COMPLETED",
      isDeleted: false,
    },
  });
};

const calcMonthlyRentalStatus = async (
  tenantId: string,
  from: Date,
  to: Date
) => {
  const statuses = [
    "ACTIVE",
    "COMPLETED",
    "DECLINED",
    "CANCELED",
    "REFUNDED",
    "CONFIRMED",
  ] as const;

  for (const status of statuses) {
    const count = await prisma.rental.count({
      where: {
        tenantId,
        createdAt: { gte: from, lte: to },
        status: status,
        isDeleted: false,
      },
    });

    await saveMonthlyRentalStatus(
      tenantId,
      getMonth(from) + 1,
      getYear(from),
      "MONTHLY_RENTAL_STATUS",
      status,
      count,
      from,
      to
    );
  }
};

const saveMonthlyRentalStatus = async (
  tenantId: string,
  month: number,
  year: number,
  stat: "MONTHLY_RENTAL_STATUS",
  status:
    | "ACTIVE"
    | "COMPLETED"
    | "DECLINED"
    | "CANCELED"
    | "REFUNDED"
    | "CONFIRMED",
  value: number,
  from: Date,
  to: Date
) => {
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

cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("Running stats cron job...");
    await runMonthlyStatCron();
    await runYearlyStatCron();
  } catch (error) {
    console.error("Error running stats cron job:", error);
  } finally {
    console.log("Stats cron job completed.");
  }
});
