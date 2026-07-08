import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = pkg;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ADMIN giữ lại cho tương thích dữ liệu cũ; ORG_ADMIN là role quản trị tổ chức
  const roleNames = ["SUPER_ADMIN", "ORG_ADMIN", "ADMIN", "TEACHER", "STUDENT"];
  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Seed roles done");

  // Super Admin của nền tảng (organizationId = null)
  const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@lms.local";
  const password = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: "Platform Super Admin",
        status: "ACTIVE",
        organizationId: null,
      },
    });
    await prisma.userRole.create({ data: { userId: user.id, roleId: superAdminRole.id } });
    console.log(`Seed super admin done: ${email}`);
  } else {
    console.log("Super admin already exists, skipped");
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
