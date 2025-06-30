import loggerConfig from "../config/logger.config";
import prisma from "../config/prisma.config";
import cron from "node-cron";

const username = process.env.GEONAME_USER;

interface CountryData {
  geonameId: number;
  countryCode: string;
  countryName: string;
}

interface StateData {
  geoNameId: number;
  toponymName: string;
}

interface VillageData {
  geoNameId: number;
  toponymName: string;
}

const fetchCountryData = async () => {
  try {
    const response = await fetch(
      `http://api.geonames.org/countryInfoJSON?username=${username}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.geonames) {
      throw new Error("No countries data found in response");
    }

    const countries: CountryData[] = data.geonames.map((country: any) => ({
      geonameId: country.geonameId,
      countryCode: country.countryCode,
      countryName: country.countryName,
    }));

    for (const country of countries) {
      await prisma.country.upsert({
        where: { code: country.countryCode },
        create: {
          geoNameId: country.geonameId,
          code: country.countryCode,
          country: country.countryName,
        },
        update: {
          geoNameId: country.geonameId,
          country: country.countryName,
        },
      });
    }
  } catch (error) {
    loggerConfig.logger.error("Error in fetchCountryData:", error);
  }
};

const fetchVillagesData = async () => {
  try {
    const states = await prisma.state.findMany({
      select: { geoNameId: true, id: true, state: true },
    });

    for (const state of states) {
      const response = await fetch(
        `http://api.geonames.org/childrenJSON?geonameId=${state.geoNameId}&username=${username}`
      );

      if (!response.ok) {
        loggerConfig.logger.warn(
          `Failed to fetch states for country ${state.state}`
        );
        continue;
      }

      const data = await response.json();

      if (!data.geonames || data.geonames.length === 0) {
        continue;
      }

      const villages: VillageData[] = data.geonames.map(
        (state: any, idx: number) => {
          return {
            geoNameId: state.geonameId,
            toponymName: state.toponymName,
          };
        }
      );

      for (const village of villages) {
        const originalName = village.toponymName;

        const existingState = await prisma.village.findFirst({
          where: {
            village: {
              equals: originalName,
              mode: "insensitive",
            },
            stateId: state.id,
          },
          select: { id: true },
        });

        if (existingState?.id) {
          await prisma.village.update({
            where: { id: existingState.id },
            data: {
              geoNameId: village.geoNameId,
              village: originalName,
            },
          });
        } else {
          await prisma.village.create({
            data: {
              geoNameId: village.geoNameId,
              village: originalName,
              stateId: state.id,
            },
          });
        }
      }
    }
  } catch (error) {
    loggerConfig.logger.error("Error in fetchVillageData:", error);
  }
};

const fetchStatesData = async () => {
  try {
    const countries = await prisma.country.findMany({
      select: { code: true, geoNameId: true, id: true },
    });

    for (const country of countries) {
      const response = await fetch(
        `http://api.geonames.org/childrenJSON?geonameId=${country.geoNameId}&username=${username}`
      );

      if (!response.ok) {
        loggerConfig.logger.warn(
          `Failed to fetch states for country ${country.code}`
        );
        continue;
      }

      const data = await response.json();

      if (!data.geonames || data.geonames.length === 0) {
        continue;
      }

      const states: StateData[] = data.geonames.map(
        (state: any, idx: number) => {
          return {
            geoNameId: state.geonameId,
            toponymName: state.toponymName,
          };
        }
      );

      for (const state of states) {
        const originalName = state.toponymName;
        const normalizedName = normalizeStateName(originalName);

        const existingState = await prisma.state.findFirst({
          where: {
            state: {
              equals: normalizedName,
              mode: "insensitive",
            },
            countryId: country.id,
          },
          select: { id: true },
        });

        if (existingState?.id) {
          await prisma.state.update({
            where: { id: existingState.id },
            data: {
              geoNameId: state.geoNameId,
              state: normalizedName,
            },
          });
        } else {
          await prisma.state.create({
            data: {
              geoNameId: state.geoNameId,
              state: normalizedName,
              countryId: country.id,
            },
          });
        }
      }
    }
  } catch (error) {
    loggerConfig.logger.error("Error in fetchStatesData:", error);
  }
};

function normalizeStateName(name: string): string {
  return name
    .replace(/\bSaint\b/gi, "St.") // Replace any occurrence of "Saint" with "St."
    .replace(/\bParish of St\./gi, "St.") // If prefixed with "Parish of St.", just keep the name
    .replace(/\bParish of\b/gi, "") // Remove any "Parish of" text
    .replace(/\bState of\b/gi, "") // Remove any "State of" text
    .replace(/\bDistrict\b/gi, "") // Remove any "District" text
    .replace(/\bProvince\b/gi, "") // Remove any "Province" text
    .trim();
}

// cron.schedule("*/5 * * * *", async () => {
//   try {
//     console.log("Running village cron job...");
//     // await fetchStatesData();
//     await fetchVillagesData();
//   } catch (error) {
//     console.error("Error running village job:", error);
//   } finally {
//     console.log("village cron job completed.");
//   }
// });
