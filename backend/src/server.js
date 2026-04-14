import "./config/env.js"; // load .env trước tất cả
import { createServer } from "http";
import app from "./app.js";
import prisma from "./lib/prisma.js";
import { port } from "./config/env.js";
import { initSocket } from "./lib/socket.js";

const server = createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
