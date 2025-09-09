import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma.config';
import client from '../config/dodo.config';
import { WebhookUnbrandedRequiredHeaders } from 'standardwebhooks';
import { Webhook } from 'standardwebhooks';
import { SubscriptionStatus } from '@prisma/client';

const REDIRECT_URI = process.env.DODOPAYMENTS_REDIRECT_URI || '';
const WEBHOOK_KEY = process.env.DODOPAYMENTS_WEBHOOK_KEY || '';

const webhook = new Webhook(WEBHOOK_KEY);

const createDodoPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req.body;
  try {
    const dodoResponse = await client.subscriptions.create({
      billing: {
        city: body.city,
        country: body.country,
        state: body.state,
        street: body.street,
        zipcode: body.zipcode,
      },
      customer: {
        email: body.email,
        name: body.name,
      },
      metadata: {
        tenantId: body.tenantId,
      },
      payment_link: true,
      product_id: body.productId,
      quantity: 1,
      return_url: REDIRECT_URI,
    });

    return res.status(201).json(dodoResponse);
  } catch (error) {
    next(error);
  }
};

const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const { paymentId } = req.params;

  try {
    const payment = await client.payments.retrieve(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const invoice = await client.invoices.payments.retrieve(payment.payment_id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const blob = await invoice.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${paymentId}.pdf`,
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const dodoPaymentWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body;

    const webhookHeaders: WebhookUnbrandedRequiredHeaders = {
      'webhook-id': (req.headers['webhook-id'] || '') as string,
      'webhook-signature': (req.headers['webhook-signature'] || '') as string,
      'webhook-timestamp': (req.headers['webhook-timestamp'] || '') as string,
    };

    const raw = JSON.stringify(body);

    const samePayloadOutput = await webhook.verify(raw, webhookHeaders);
    console.log(samePayloadOutput == body);

    switch (body.type) {
      case 'subscription.active':
        handleSubscriptionActive(body.data);
        break;
      case 'payment.succeeded':
        break;
      case 'subscription.on_hold':
        handleSubscriptionPending(body.data);
        break;
      case 'subscription.failed':
        handleSubscriptionFailed(body.data);
        break;
      case 'payment.failed':
        break;
      case 'subscription.renewed':
        handleSubscriptionActive(body.data);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

const handleSubscriptionActive = async (data: any) => {
  try {
    const tenantId = data.metadata.tenantId;
    const subscriptionData = {
      tenantId: data.metadata.tenantId,
      dodoCustomerId: data.customer.customer_id,
      productId: data.product_id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(data.created_at),
      endDate: new Date(data.next_billing_date),
    };

    await prisma.tenantSubscription.upsert({
      where: { tenantId: tenantId },
      update: {
        productId: subscriptionData.productId,
        status: subscriptionData.status,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
      },
      create: subscriptionData,
    });
  } catch (error) {
    console.error('Error handling subscription active:', error);
  }
};

const handleSubscriptionFailed = async (data: any) => {
  try {
    const tenantId = data.metadata.tenantId;
    const subscriptionData = {
      tenantId: data.metadata.tenantId,
      dodoCustomerId: data.customer.customer_id,
      productId: data.product_id,
      status: SubscriptionStatus.SUSPENDED,
      startDate: new Date(data.created_at),
      endDate: new Date(data.next_billing_date),
    };

    await prisma.tenantSubscription.upsert({
      where: { tenantId: tenantId },
      update: {
        productId: subscriptionData.productId,
        status: subscriptionData.status,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
      },
      create: subscriptionData,
    });
  } catch (error) {
    console.error('Error handling subscription failed:', error);
  }
};

const handleSubscriptionPending = async (data: any) => {
  try {
    const tenantId = data.metadata.tenantId;
    const subscriptionData = {
      tenantId: data.metadata.tenantId,
      dodoCustomerId: data.customer.customer_id,
      productId: data.product_id,
      status: SubscriptionStatus.PENDING,
      startDate: new Date(data.created_at),
      endDate: new Date(data.next_billing_date),
    };

    await prisma.tenantSubscription.upsert({
      where: { tenantId: tenantId },
      update: {
        productId: subscriptionData.productId,
        status: subscriptionData.status,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
      },
      create: subscriptionData,
    });
  } catch (error) {
    console.error('Error handling subscription pending:', error);
  }
};

export default {
  createDodoPayment,
  getInvoice,
  dodoPaymentWebhook,
};
