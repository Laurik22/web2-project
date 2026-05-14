
import app from './app.js';
import prisma from './lib/prisma.js';
import logger from "./lib/logger.js";

const PORT = process.env.PORT || 3000;

// Start the server
const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "server listening");
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}
process.on("SIGINT",  shutdown);
process.on("SIGTERM", shutdown);

