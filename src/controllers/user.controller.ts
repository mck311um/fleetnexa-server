import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        tenantId: true,
        createdAt: true,
        theme: true,
        color: true,
        tenant: {
          select: {
            tenantCode: true,
            tenantName: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      fullName: `${user.firstName} ${user.lastName}`,
      tenantId: user.tenantId,
      tenant: user.tenant?.tenantCode,
      tenantName: user.tenant?.tenantName,
      createdAt: user.createdAt,
      theme: user.theme,
      color: user.color,
    };

    res.json(userData);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export default { getCurrentUser };
