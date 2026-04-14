import prisma from "../../lib/prisma.js";

export const findUserByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });

export const findUserById = (id) =>
  prisma.user.findUnique({ where: { id } });

export const updateUser = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    omit: { passwordHash: true },
  });

export const findRoleByName = (name) => prisma.role.findUnique({ where: { name } });

export const registerUser = ({ email, passwordHash, fullName, phone, roleId }) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash, fullName, phone },
    });
    await tx.userRole.create({ data: { userId: user.id, roleId } });
    return user;
  });

export const saveRefreshToken = ({ userId, token, expiresAt }) =>
  prisma.refreshToken.create({ data: { userId, token, expiresAt } });

export const findRefreshToken = (token) =>
  prisma.refreshToken.findUnique({
    where: { token },
    include: { user: { include: { roles: { include: { role: true } } } } },
  });

export const deleteRefreshToken = (token) =>
  prisma.refreshToken.delete({ where: { token } });

export const deleteAllRefreshTokensByUser = (userId) =>
  prisma.refreshToken.deleteMany({ where: { userId } });

export const deleteExpiredRefreshTokens = () =>
  prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });

export const upsertPasswordOtp = ({ userId, otp, expiresAt }) =>
  prisma.passwordOtp.upsert({
    where: { userId },
    update: { otp, expiresAt, createdAt: new Date() },
    create: { userId, otp, expiresAt },
  });

export const findPasswordOtp = (userId) =>
  prisma.passwordOtp.findUnique({ where: { userId } });

export const deletePasswordOtp = (userId) =>
  prisma.passwordOtp.delete({ where: { userId } });

export const upsertEmailVerification = ({ userId, token, expiresAt }) =>
  prisma.emailVerification.upsert({
    where: { userId },
    update: { token, expiresAt, createdAt: new Date() },
    create: { userId, token, expiresAt },
  });

export const findEmailVerificationByToken = (token) =>
  prisma.emailVerification.findUnique({ where: { token }, include: { user: true } });

export const deleteEmailVerification = (userId) =>
  prisma.emailVerification.delete({ where: { userId } }).catch(() => {});

export const activateUser = (userId) =>
  prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } });
