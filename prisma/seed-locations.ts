import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Country as CountryData, State as StateData } from "country-state-city";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Seed countries.
  const countries = CountryData.getAllCountries();

  await prisma.country.createMany({
    data: countries.map((country) => ({
      name: country.name,
      iso2: country.isoCode,
    })),
    skipDuplicates: true,
  });

  console.log(`Processed ${countries.length} countries.`);

  // 2. Fetch countries and build an ISO2-to-ID mapping.
  const savedCountries = await prisma.country.findMany({
    select: {
      id: true,
      iso2: true,
    },
  });

  const countryIdByIso2 = new Map(
    savedCountries
      .filter((country) => country.iso2 !== null)
      .map((country) => [country.iso2!, country.id]),
  );

  // 3. Prepare states with their corresponding country IDs.
  const states = StateData.getAllStates();

  let skippedCount = 0;

  const stateRecords = states.flatMap((state) => {
    const countryId = countryIdByIso2.get(state.countryCode);

    if (!countryId) {
      skippedCount++;
      return [];
    }

    return [
      {
        countryId,
        name: state.name,
        code: state.isoCode,
      },
    ];
  });

  // 4. Seed states.
  await prisma.state.createMany({
    data: stateRecords,
    skipDuplicates: true,
  });

  console.log(`Processed ${stateRecords.length} states.`);
  console.log(`Skipped ${skippedCount} states.`);
}

main()
  .catch((error) => {
    console.error("Error seeding location data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
