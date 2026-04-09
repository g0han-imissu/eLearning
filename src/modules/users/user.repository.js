const prisma = require("../../lib/prisma");

const findUsers = () =>
  prisma.user.findMany({
    omit: { passwordHash: true },
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });

const updateStatusById = (id, status) => prisma.user.update({ where: { id }, data: { status } });

const findRolesByNames = (roleNames) => prisma.role.findMany({ where: { name: { in: roleNames } } });

const clearUserRoles = (userId) => prisma.userRole.deleteMany({ where: { userId } });

const createUserRoles = (rows) => prisma.userRole.createMany({ data: rows, skipDuplicates: true });

module.exports = { findUsers, updateStatusById, findRolesByNames, clearUserRoles, createUserRoles };
