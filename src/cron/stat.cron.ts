import { PrismaClient } from "@prisma/client";
import {
  startOfWeek,
  endOfWeek,
  getISOWeek,
  getYear,
  eachWeekOfInterval,
  eachMonthOfInterval,
  getMonth,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import cron from "node-cron";

const prisma = new PrismaClient();

export const runWeeklyStatCron = async () => {
  const tenants = await prisma.tenant.findMany();
  const now = new Date();
  const currentYear = getYear(now);

  for (const tenant of tenants) {
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    const weeksInYear = eachWeekOfInterval(
      { start: yearStart, end: yearEnd },
      { weekStartsOn: 1 }
    );

    for (const weekDate of weeksInYear) {
      const week = getISOWeek(weekDate);
      const year = getYear(weekDate);
      const from = startOfWeek(weekDate, { weekStartsOn: 1 });
      const to = endOfWeek(weekDate, { weekStartsOn: 1 });

      await Promise.all([
        saveStat(
          tenant.id,
          week,
          year,
          "TOTAL_REVENUE",
          await calcTotalRevenue(tenant.id, from, to),
          to,
          from
        ),
        saveStat(
          tenant.id,
          week,
          year,
          "NEW_BOOKINGS",
          await calcNewBookings(tenant.id, from, to),
          to,
          from
        ),
        saveStat(
          tenant.id,
          week,
          year,
          "RENTED_VEHICLES",
          await calcRentedVehicles(tenant.id, from, to),
          to,
          from
        ),
        saveStat(
          tenant.id,
          week,
          year,
          "TOTAL_CUSTOMERS",
          await calcNewCustomers(tenant.id, from, to),
          to,
          from
        ),
        saveStat(
          tenant.id,
          week,
          year,
          "AVERAGE_BOOKING",
          await calcAverageBookingDuration(tenant.id, from, to),
          to,
          from
        ),
      ]);
    }
  }

  console.log("✅ Weekly stats saved for all tenants");
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
          "MONTHLY_BOOKINGS",
          await calcMonthlyBookings(tenant.id, from, to),
          to,
          from
        ),
        calcMonthlyBookingStatus(tenant.id, from, to),
      ]);
    }
  }

  console.log("✅ Monthly stats saved for all tenants");
};
const saveStat = async (
  tenantId: string,
  week: number,
  year: number,
  stat:
    | "TOTAL_REVENUE"
    | "NEW_BOOKINGS"
    | "RENTED_VEHICLES"
    | "TOTAL_CUSTOMERS"
    | "AVERAGE_BOOKING",
  value: number,
  from: Date,
  to: Date
) => {
  await prisma.tenantWeeklyStats.upsert({
    where: {
      tenantId_week_year_stat: {
        tenantId,
        week,
        year,
        stat,
      },
    },
    update: { value: value ?? 0 },
    create: {
      tenantId,
      week,
      year,
      stat,
      value: value ?? 0,
      startDate: from,
      endDate: to,
    },
  });
};

const calcTotalRevenue = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  const result = await prisma.values.aggregate({
    where: {
      booking: {
        tenantId,
        createdAt: { gte: from, lte: to },
        status: "COMPLETED",
      },
    },
    _sum: { netTotal: true },
  });

  return result._sum.netTotal ?? 0;
};

const calcNewBookings = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  return await prisma.booking.count({
    where: {
      tenantId,
      createdAt: { gte: from, lte: to },
    },
  });
};

const calcRentedVehicles = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  return await prisma.booking.count({
    where: {
      tenantId,
      createdAt: { gte: from, lte: to },
      status: "COMPLETED",
    },
  });
};

const calcNewCustomers = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  return await prisma.customer.count({
    where: {
      tenantId,
      createdAt: { gte: from, lte: to },
    },
  });
};

const calcAverageBookingDuration = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  const bookings = await prisma.booking.findMany({
    where: {
      tenantId,
      startDate: { gte: from },
      endDate: { lte: to },
      status: "COMPLETED",
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  if (bookings.length === 0) return 0;

  const totalDays = bookings.reduce((acc, booking) => {
    const diff = Math.ceil(
      (booking.endDate.getTime() - booking.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return acc + diff;
  }, 0);

  return totalDays / bookings.length;
};

const saveMonthlyStat = async (
  tenantId: string,
  month: number,
  year: number,
  stat: "MONTHLY_EARNINGS" | "MONTHLY_BOOKINGS" | "MONTHLY_BOOKING_STATUS",
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
  const result = await prisma.values.aggregate({
    where: {
      booking: {
        tenantId,
        startDate: { gte: from, lte: to },
        status: "COMPLETED",
      },
    },
    _sum: { netTotal: true },
  });

  return result._sum.netTotal ?? 0;
};

const calcMonthlyBookings = async (
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> => {
  return await prisma.booking.count({
    where: {
      tenantId,
      startDate: { gte: from, lte: to },
      status: "COMPLETED",
    },
  });
};

const calcMonthlyBookingStatus = async (
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
    const count = await prisma.booking.count({
      where: {
        tenantId,
        createdAt: { gte: from, lte: to },
        status: status,
      },
    });

    await saveMonthlyBookingStatus(
      tenantId,
      getMonth(from) + 1,
      getYear(from),
      "MONTHLY_BOOKING_STATUS",
      status,
      count,
      from,
      to
    );
  }
};

const saveMonthlyBookingStatus = async (
  tenantId: string,
  month: number,
  year: number,
  stat: "MONTHLY_BOOKING_STATUS",
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
  await prisma.tenantMonthlyBookingStats.upsert({
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

cron.schedule("* * * * *", async () => {
  try {
    await runWeeklyStatCron();
    await runMonthlyStatCron();
  } catch (error) {
    console.error("Error running stats cron job:", error);
  } finally {
    console.log("Stats cron job completed.");
  }
});
