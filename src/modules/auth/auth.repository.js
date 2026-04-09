const prisma = require("../../lib/prisma");

const findUserByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });

const findRoleByName = (name) => prisma.role.findUnique({ where: { name } });

const createUserWithRole = ({ email, passwordHash, fullName, phone, roleId }) =>
  prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone,
      roles: { create: { roleId } },
    },
    include: { roles: { include: { role: true } } },
  });

module.exports = { findUserByEmail, findRoleByName, createUserWithRole };
