import { log } from "console";
import loggerConfig from "../config/logger.config";
import prisma from "../config/prisma.config";
import cron from "node-cron";

async function runGetExchangeRates() {
  const currencies = await prisma.currency.findMany({
    select: { code: true },
  });

  const pairs = [];
  for (const base of currencies) {
    for (const target of currencies) {
      if (base.code !== target.code) {
        pairs.push({ base: base.code, target: target.code });
      }
    }
  }

  const validRates: { base: string; target: string; rate: number }[] = [];

  for (const { base, target } of pairs) {
    try {
      const apiKey = process.env.EXCHANGERATE_API_KEY;
      const url = `https://api.exchangerate.host/convert?access_key=${apiKey}&from=${base}&to=${target}&amount=1`;

      const res = await fetch(url);
      const data = await res.json();

      console.log(`Fetched ${base}→${target}:`, data);

      if (data.success && data.result) {
        validRates.push({ base, target, rate: data.result });
      } else {
        loggerConfig.logger.error(data.error);
        console.warn(
          `Failed to fetch ${base}→${target}: ${data.error?.info || "Unknown error"}`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 15000));
    } catch (err: any) {
      console.error(`Error fetching ${base}/${target}:`, err.message);
    }
  }

  if (validRates.length > 0) {
    await prisma.$transaction(
      validRates.map(({ base, target, rate }) =>
        prisma.exchangeRate.upsert({
          where: { base_target: { base, target } },
          update: { rate, updatedAt: new Date() },
          create: { base, target, rate },
        })
      )
    );
    console.log(`Updated ${validRates.length} exchange rates.`);
  } else {
    console.warn("No valid rates fetched.");
  }
}

// cron.schedule("* * * * *", async () => {
//   try {
//     console.log("Running exchange rate cron job...");
//     await runGetExchangeRates();
//   } catch (error) {
//     console.error("Error running stats cron job:", error);
//   } finally {
//     console.log("Stats cron job completed.");
//   }
// });
