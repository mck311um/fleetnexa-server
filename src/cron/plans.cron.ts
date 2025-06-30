import DodoPayments from "dodopayments";
import cron from "node-cron";
import prisma from "../config/prisma.config";
import client from "../config/dodo.config";

const getProducts = async () => {
  try {
    const response = await client.products.list();
    const products = response.items;

    await prisma.$transaction(async (tx) => {
      for (const product of products) {
        const productData = {
          productId: product.product_id,
          name: product.name ?? "",
          description: product.description ?? "",
          price: (product.price || 0) / 100,
          priceXCD: parseFloat(
            (((product.price || 0) * 2.712) / 100).toFixed(2)
          ),
        };

        await tx.subscriptionPlan.upsert({
          where: { productId: product.product_id },
          update: { ...productData },
          create: { ...productData },
        });
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const getTransactions = async () => {
  try {
    const response = await client.payments.list();
    const payments = response.items;

    await prisma.$transaction(async (tx) => {
      for (const payment of payments) {
        const customerId = payment.customer.customer_id;
        const subscriptionId = payment.subscription_id;

        const tenantSub = await tx.tenantSubscription.findUnique({
          where: { dodoCustomerId: customerId },
        });

        if (!tenantSub) {
          continue;
        }

        if (!subscriptionId) {
          continue;
        }

        const subscription =
          await client.subscriptions.retrieve(subscriptionId);

        const paymentData = {
          paymentId: payment.payment_id,
          totalAmount: (payment.total_amount || 0) / 100,
          customerId: payment.customer.customer_id,
          status: payment.status || "unknown",
          productId: subscription.product_id,
          paymentDate: new Date(payment.created_at),
        };

        await tx.subscriptionPayment.upsert({
          where: { paymentId: payment.payment_id },
          update: { ...paymentData },
          create: { ...paymentData },
        });
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

cron.schedule("0 * * * *", async () => {
  try {
    console.log("Running dodo cron job...");
    await getTransactions();
  } catch (error) {
    console.error("Error running dodo cron job:", error);
  } finally {
    console.log("Dodo cron job completed.");
  }
});

cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Running dodo cron job...");
    await getProducts();
  } catch (error) {
    console.error("Error running dodo cron job:", error);
  } finally {
    console.log("Dodo cron job completed.");
  }
});
