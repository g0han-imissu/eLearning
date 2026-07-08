import { prismaAdmin as prisma } from "../../lib/prisma.js";

// Module auth chạy trước khi có tenant context (login/refresh/register)
// nên dùng prismaAdmin (không auto-scope). Mọi query ở đây đều theo danh tính user.

export const findUserByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
    include: {
      roles: { include: { role: true } },
      organization: { select: { id: true, name: true, slug: true, code: true, status: true } },
    },
  });

// Login bằng email hoặc username (username kiểu "bkhn.gv001" — không chứa @)
export const findUserByIdentifier = (identifier) =>
  prisma.user.findUnique({
    where: identifier.includes("@") ? { email: identifier } : { username: identifier.toLowerCase() },
    include: {
      roles: { include: { role: true } },
      organization: { select: { id: true, name: true, slug: true, code: true, status: true } },
    },
  });

// Thu hồi mật khẩu tạm trong import row ngay khi user tự đặt mật khẩu
export const clearTempPasswordForUser = (userId) =>
  prisma.importRow.updateMany({
    where: { createdUserId: userId, tempPassword: { not: null } },
    data: { tempPassword: null },
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

// Tra mã lớp xuyên tổ chức — chỉ dùng cho luồng đăng ký công khai
export const findClassByCodeGlobal = (code) =>
  prisma.class.findFirst({
    where: { code },
    include: { organization: { select: { id: true, status: true } } },
  });

export const registerUser = ({ email, passwordHash, fullName, phone, roleId, organizationId, pendingClassId }) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash, fullName, phone, status: 'ACTIVE', organizationId },
    });
    await tx.userRole.create({ data: { userId: user.id, roleId } });
    if (pendingClassId) {
      await tx.enrollment.create({
        data: { classId: pendingClassId, studentId: user.id, organizationId, status: 'PENDING' },
      });
    }
    return user;
  });

export const saveRefreshToken = ({ userId, token, expiresAt }) =>
  prisma.refreshToken.create({ data: { userId, token, expiresAt } });

export const findRefreshToken = (token) =>
  prisma.refreshToken.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
          organization: { select: { id: true, status: true } },
        },
      },
    },
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
