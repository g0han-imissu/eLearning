const prisma = require("../../lib/prisma");

const findUserByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });

const findRoleByName = (name) => prisma.role.findUnique({ where: { name } });

// Tạo user và gán role trong 1 transaction
// Nếu gán role lỗi → user cũng bị hoàn tác, không để lại user không có role
const registerUser = ({ email, passwordHash, fullName, phone, roleId }) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash, fullName, phone },
    });
    await tx.userRole.create({ data: { userId: user.id, roleId } });
    return user;
  });

module.exports = { findUserByEmail, findRoleByName, registerUser };
