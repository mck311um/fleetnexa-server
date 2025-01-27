import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createTenant = async (
  tenantCode: string,
  name: string,
  email: string,
  number: string
) => {
  const tenant = await prisma.tenant.create({
    data: {
      tenantCode,
      name,
      email,
      number,
    },
  });
  return tenant;
};

export const getTenantByCode = async (tenantCode: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { tenantCode },
    include: { users: true },
  });
  return tenant;
};
