import { PrismaClient, RentalType } from "@prisma/client";

const prisma = new PrismaClient();

const addTenant = async (req: any, res: any) => {
  const { tenantCode, name, email, number } = req.body;
  try {
    await prisma.tenant.create({
      data: {
        tenantCode,
        name,
        email,
        number,
        setupComplete: false,
        minimumBooking: 0,
        rentalType: RentalType.DAILY,
        discounts: {},
        paymentMethods: {},
        pickupLocations: {},
        dropoffLocations: {},
        services: {},
      },
    });

    res.status(201).end();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

const getTenantData = async (req: any, res: any) => {
  const { tenantCode } = req.params;

  console.log(tenantCode);

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { tenantCode },
      include: {
        discounts: true,
        paymentMethods: true,
        pickupLocations: true,
        dropoffLocations: true,
        services: true,
        users: true,
        vehicles: true,
      },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Invalid tenant code" });
    }

    res.status(201).json(tenant);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export default {
  addTenant,
  getTenantData,
};
