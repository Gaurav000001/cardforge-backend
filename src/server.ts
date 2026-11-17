
import "dotenv/config";

import app from "./app.js";
import { prisma } from "./config/prisma.js";

const port = Number(process.env.PORT ?? 3000);

async function startServer() {
  try {
    await prisma.$connect();

    const server = app.listen(port, () => {
      console.log(`CardForge API running on port ${port}`);
    });

    const shutdown = () => {
      console.log("Shutting down CardForge API...");

      server.close(async () => {
        try {
          await prisma.$disconnect();
          console.log("Database connection closed.");
          process.exit(0);
        } catch (error) {
          console.error("Error closing database connection:", error);
          process.exit(1);
        }
      });
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start CardForge API:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void startServer();
