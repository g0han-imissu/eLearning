import prisma from "../../lib/prisma.js";

export const findUsers = () =>
  prisma.user.findMany({
    omit: { passwordHash: true },
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });

export const updateStatusById = (id, status) =>
  prisma.user.update({ where: { id }, data: { status } });

export const findRolesByNames = (roleNames) =>
  prisma.role.findMany({ where: { name: { in: roleNames } } });

export const replaceUserRoles = (userId, rows) =>
  prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    await tx.userRole.createMany({ data: rows, skipDuplicates: true });
  });
