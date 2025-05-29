import DodoPayments from "dodopayments";
import cron from "node-cron";
import prisma from "../config/prisma.config";

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  environment:
    process.env.NODE_ENV === "development" ? "test_mode" : "live_mode",
});

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

cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Running products cron job...");
    await getProducts();
  } catch (error) {
    console.error("Error running products cron job:", error);
  } finally {
    console.log("Products cron job completed.");
  }
});
