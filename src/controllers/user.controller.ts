import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const createUser = async (
  tenantCode: string,
  firstName: string,
  lastName: string,
  password: string,
  username: string
) => {
  const tenant = await prisma.tenant.findUnique({
    where: {
      tenantCode,
    },
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      password: hashedPassword,
      tenantId: tenant.id,
      username: username.toLowerCase(),
    },
  });

  return user;
};

export const loginUser = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
    include: {
      tenant: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const data = {
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    initials: user.firstName[0] + user.lastName[0],
    name: user.firstName + " " + user.lastName,
    tenantCode: user.tenant?.tenantCode,
  };

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      tenantCode: user.tenant?.tenantCode,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return { data, token };
};
