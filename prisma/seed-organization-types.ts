import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const organizationTypes = [
  { name: "School", code: "SCHOOL" },
  { name: "College", code: "COLLEGE" },
  { name: "University", code: "UNIVERSITY" },
  { name: "Corporate", code: "CORPORATE" },
  { name: "Hospital", code: "HOSPITAL" },
  { name: "Government Organization", code: "GOVERNMENT" },
  { name: "Training Institute", code: "TRAINING_INSTITUTE" },
  { name: "Other", code: "OTHER" },
];

async function main() {
  for (const organizationType of organizationTypes) {
    await prisma.organizationType.upsert({
      where: { code: organizationType.code },
      update: { name: organizationType.name },
      create: organizationType,
    });
  }

  console.log("Organization types seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Error seeding organization types:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
