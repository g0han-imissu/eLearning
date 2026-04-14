import "./config/env.js"; // load .env trước tất cả
import app from "./app.js";
import prisma from "./lib/prisma.js";
import { port } from "./config/env.js";

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
