import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiError from "../../utils/apiError.js";
import { jwtSecret, jwtExpiresIn, refreshTokenExpiresInDays } from "../../config/env.js";
import {
  findUserByEmail, findUserById, updateUser,
  findUserByIdentifier, clearTempPasswordForUser,
  findRoleByName, registerUser, findClassByCodeGlobal,
  saveRefreshToken, findRefreshToken, deleteRefreshToken,
  deleteAllRefreshTokensByUser, deleteExpiredRefreshTokens,
  upsertPasswordOtp, findPasswordOtp, deletePasswordOtp,
  findEmailVerificationByToken, deleteEmailVerification, activateUser,
} from "./auth.repository.js";
import { sendOtpEmail } from "../../lib/email.js";

// organizationId/roles trong payload chỉ để client hiển thị UI;
// authorization luôn dựa trên dữ liệu load lại từ DB ở auth.middleware.
const signAccessToken = (user) =>
  jwt.sign(
    {
      userId: user.id,
      organizationId: user.organizationId ?? null,
      roles: (user.roles || []).map((x) => x.role?.name ?? x),
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

const createRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresInDays);
  await saveRefreshToken({ userId, token, expiresAt });
  return token;
};

export const register = async ({ email, password, fullName, phone, classCode }) => {
  const existed = await findUserByEmail(email);
  if (existed) throw new ApiError(409, "Email already exists");

  // Multi-tenant: student phải đăng ký qua mã lớp để xác định Organization
  if (!classCode) throw new ApiError(400, "Vui lòng nhập mã lớp học để đăng ký.");
  const classItem = await findClassByCodeGlobal(classCode);
  if (!classItem) throw new ApiError(404, "Không tìm thấy lớp học với mã này.");
  if (classItem.organization.status !== "ACTIVE") {
    throw new ApiError(403, "Tổ chức của lớp học này hiện không hoạt động.");
  }
  if (classItem.status === "CLOSED" || classItem.status === "ARCHIVED") {
    throw new ApiError(400, "Lớp học này không còn nhận thêm học viên.");
  }

  const studentRole = await findRoleByName("STUDENT");
  if (!studentRole) throw new ApiError(500, "Missing STUDENT role");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await registerUser({
    email, passwordHash, fullName, phone,
    roleId: studentRole.id,
    organizationId: classItem.organizationId,
    pendingClassId: classItem.id,
  });

  return {
    message: "Đăng ký thành công. Yêu cầu tham gia lớp đã được gửi tới giảng viên.",
    user: { id: user.id, email: user.email, status: user.status },
  };
};

export const verifyEmail = async ({ token }) => {
  if (!token) throw new ApiError(400, "Missing token");

  const record = await findEmailVerificationByToken(token);
  if (!record) throw new ApiError(400, "Liên kết xác nhận không hợp lệ hoặc đã được sử dụng.");
  if (record.expiresAt < new Date()) {
    await deleteEmailVerification(record.userId);
    throw new ApiError(400, "Liên kết xác nhận đã hết hạn. Vui lòng đăng ký lại.");
  }

  if (record.user.status !== "ACTIVE") {
    await activateUser(record.userId);
  }
  await deleteEmailVerification(record.userId);

  return { message: "Tài khoản đã được xác nhận. Bạn có thể đăng nhập ngay bây giờ." };
};

// Org Admin nhận link mời qua email → đặt mật khẩu lần đầu + kích hoạt
export const activateAccount = async ({ token, password }) => {
  const record = await findEmailVerificationByToken(token);
  if (!record) throw new ApiError(400, "Liên kết kích hoạt không hợp lệ hoặc đã được sử dụng.");
  if (record.expiresAt < new Date()) {
    throw new ApiError(400, "Liên kết kích hoạt đã hết hạn. Vui lòng liên hệ quản trị viên nền tảng.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await updateUser(record.userId, { passwordHash, status: "ACTIVE", mustChangePassword: false });
  await deleteEmailVerification(record.userId);
  await clearTempPasswordForUser(record.userId);

  return { message: "Tài khoản đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ." };
};

export const login = async ({ email, password }) => {
  const user = await findUserByIdentifier(email); // email hoặc username
  if (!user) throw new ApiError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");
  if (user.status !== "ACTIVE") throw new ApiError(403, "Account is not active");
  if (user.organization && user.organization.status !== "ACTIVE") {
    throw new ApiError(403, "Tổ chức của bạn đang bị tạm khóa. Vui lòng liên hệ quản trị viên nền tảng.");
  }

  await deleteExpiredRefreshTokens();

  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      mustChangePassword: user.mustChangePassword,
      roles: user.roles.map((x) => x.role.name),
      organization: user.organization
        ? { id: user.organization.id, name: user.organization.name, slug: user.organization.slug, code: user.organization.code }
        : null,
    },
  };
};

// Đổi mật khẩu bắt buộc lần đầu (user được cấp mật khẩu tạm khi import)
export const firstChangePassword = async ({ userId, newPassword }) => {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (!user.mustChangePassword) {
    throw new ApiError(400, "Tài khoản này không yêu cầu đổi mật khẩu lần đầu.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUser(userId, { passwordHash, mustChangePassword: false });
  await clearTempPasswordForUser(userId);
  await deleteAllRefreshTokensByUser(userId);

  return { message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." };
};

export const refresh = async ({ refreshToken }) => {
  if (!refreshToken) throw new ApiError(400, "Missing refresh token");

  const record = await findRefreshToken(refreshToken);
  if (!record) throw new ApiError(401, "Invalid refresh token");
  if (record.expiresAt < new Date()) {
    await deleteRefreshToken(refreshToken);
    throw new ApiError(401, "Refresh token expired");
  }

  const user = record.user;
  if (user.status !== "ACTIVE") throw new ApiError(403, "Account is not active");
  if (user.organization && user.organization.status !== "ACTIVE") {
    throw new ApiError(403, "Organization is suspended");
  }

  return { accessToken: signAccessToken(user) };
};

export const logout = async ({ refreshToken, logoutAll, userId }) => {
  if (logoutAll) {
    await deleteAllRefreshTokensByUser(userId);
  } else if (refreshToken) {
    await deleteRefreshToken(refreshToken).catch(() => {});
  }
  return { message: "Logged out successfully" };
};

export const requestChangePassword = async ({ userId }) => {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  await upsertPasswordOtp({ userId, otp, expiresAt });
  await sendOtpEmail({ to: user.email, otp });

  return { message: "OTP has been sent to your email." };
};

export const confirmChangePassword = async ({ userId, otp, currentPassword, newPassword }) => {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const record = await findPasswordOtp(userId);
  if (!record) throw new ApiError(400, "No OTP request found. Please request a new one.");
  if (record.expiresAt < new Date()) {
    await deletePasswordOtp(userId);
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }
  if (record.otp !== otp) throw new ApiError(400, "Invalid OTP.");

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new ApiError(400, "Current password is incorrect.");

  if (currentPassword === newPassword) throw new ApiError(400, "New password must be different.");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUser(userId, { passwordHash, mustChangePassword: false });
  await deletePasswordOtp(userId);
  await clearTempPasswordForUser(userId);
  await deleteAllRefreshTokensByUser(userId);

  return { message: "Password changed successfully. Please login again." };
};

export const updateProfile = async ({ userId, data }) => {
  const { fullName, phone, avatarUrl, bio, specialization } = data;
  return updateUser(userId, {
    ...(fullName !== undefined && { fullName }),
    ...(phone !== undefined && { phone }),
    ...(avatarUrl !== undefined && { avatarUrl }),
    ...(bio !== undefined && { bio }),
    ...(specialization !== undefined && { specialization }),
  });
};
