import { Request, Response } from "express";
import paddle from "../config/paddle";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createPaddleCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: tenantId,
      },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const paddleCustomer = await paddle.customers.create({
      email: tenant!.email,
      name: tenant!.tenantName,
      customData: {
        tenantId: tenantId,
      },
    });

    const subscription = await prisma.tenantSubscription.create({
      data: {
        tenantId: tenantId!,
        planId: id,
        paddleCustomerId: paddleCustomer.id,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return res.status(200).json(subscription);
  } catch (error) {
    console.error("Error creating Paddle customer:", error);
    return res.status(500).json({ error: "Failed to create Paddle customer" });
  }
};

const handleWebhook = async (req: Request, res: Response) => {
  const event = req.body;

  try {
    switch (event.event_type) {
      case "subscription_activated":
        await handleSubscriptionActivated(event);
        break;
      case "subscription_cancelled":
        break;
      case "subscription_created":
        break;
      case "subscription_imported":
        break;
      case "subscription_past_due":
        break;
      case "subscription_paused":
        break;
      case "subscription_resumed":
        break;
      case "subscription_trialing":
        await handleSubscriptionTrialing(event);
      case "subscription_updated":
        break;
      default:
        console.log("Unhandled event:", event.event_type);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error handling webhook:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

const getCustomerSubscription = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: tenantId,
      },
      select: {
        subscription: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const subscriptions = await paddle.transactions.list({});

    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching customer transactions:", error);
    throw new Error("Failed to fetch customer transactions");
  }
};

const handleSubscriptionTrialing = async (event: any) => {
  const { customer_id } = event.data;

  try {
    const subscription = await prisma.tenantSubscription.findUnique({
      where: {
        paddleCustomerId: customer_id,
      },
    });

    if (!subscription) {
      console.error("Subscription not found for customer:", customer_id);
      return;
    }

    await prisma.tenantSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: "TRIAL",
        updatedAt: new Date(),
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Error updating subscription status:", error);
  }
};

const handleSubscriptionActivated = async (event: any) => {
  const { customer_id, current_billing_period } = event.data;

  try {
    const subscription = await prisma.tenantSubscription.findUnique({
      where: {
        paddleCustomerId: customer_id,
      },
    });

    if (!subscription) {
      console.error("Subscription not found for customer:", customer_id);
      return;
    }

    await prisma.tenantSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: "ACTIVE",
        updatedAt: new Date(),
        startDate: new Date(current_billing_period.starts_at),
        endDate: new Date(current_billing_period.ends_at),
      },
    });
  } catch (error) {
    console.error("Error handling subscription activated:", error);
  }
};

export default {
  handleWebhook,
  createPaddleCustomer,
  getCustomerSubscription,
};
