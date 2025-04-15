import { FormType, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const baseUrl = process.env.FORM_LINK;

const dispatchForm = async (req: Request, res: Response) => {
  const { type } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    const today = new Date();
    const id = crypto.randomUUID();
    await prisma.form.create({
      data: {
        id: id,
        tenantId: tenantId!,
        type: type as FormType,
        expiresAt: today,
        submitted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const formLink = `${baseUrl}/${type}/${id}`;

    res.status(200).json({ message: "Form created", link: formLink });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ error: "Failed to create form" });
  }
};

export default {
  dispatchForm,
};
