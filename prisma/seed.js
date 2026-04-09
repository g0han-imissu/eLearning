const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const roleNames = ["ADMIN", "TEACHER", "STUDENT"];
  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Seed roles done");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
