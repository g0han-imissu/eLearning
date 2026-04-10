const prisma = require("../../lib/prisma");

const findUsers = () =>
  prisma.user.findMany({
    omit: { passwordHash: true },
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });

const updateStatusById = (id, status) => prisma.user.update({ where: { id }, data: { status } });

const findRolesByNames = (roleNames) => prisma.role.findMany({ where: { name: { in: roleNames } } });

// Xóa toàn bộ role cũ và gán role mới trong 1 transaction
// Nếu tạo role mới lỗi → xóa cũng bị hoàn tác, user không mất role
const replaceUserRoles = (userId, rows) =>
  prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    await tx.userRole.createMany({ data: rows, skipDuplicates: true });
  });

module.exports = { findUsers, updateStatusById, findRolesByNames, replaceUserRoles };
