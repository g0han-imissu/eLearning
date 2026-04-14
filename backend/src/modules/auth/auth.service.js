import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiError from "../../utils/apiError.js";
import { jwtSecret, jwtExpiresIn, refreshTokenExpiresInDays, clientUrl } from "../../config/env.js";
import {
  findUserByEmail, findUserById, updateUser,
  findRoleByName, registerUser,
  saveRefreshToken, findRefreshToken, deleteRefreshToken,
  deleteAllRefreshTokensByUser, deleteExpiredRefreshTokens,
  upsertPasswordOtp, findPasswordOtp, deletePasswordOtp,
  upsertEmailVerification, findEmailVerificationByToken,
  deleteEmailVerification, activateUser,
} from "./auth.repository.js";
import { sendOtpEmail, sendVerificationEmail } from "../../lib/email.js";

const signAccessToken = (userId) => jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });

const createRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresInDays);
  await saveRefreshToken({ userId, token, expiresAt });
  return token;
};

export const register = async ({ email, password, fullName, phone }) => {
  const existed = await findUserByEmail(email);
  if (existed) throw new ApiError(409, "Email already exists");

  const studentRole = await findRoleByName("STUDENT");
  if (!studentRole) throw new ApiError(500, "Missing STUDENT role");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await registerUser({ email, passwordHash, fullName, phone, roleId: studentRole.id });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await upsertEmailVerification({ userId: user.id, token, expiresAt });

  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;
  await sendVerificationEmail({ to: email, verifyUrl }).catch(() => {});

  return {
    message: "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.",
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

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");
  if (user.status !== "ACTIVE") throw new ApiError(403, "Account is not active");

  await deleteExpiredRefreshTokens();

  const accessToken = signAccessToken(user.id);
  const refreshToken = await createRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map((x) => x.role.name),
    },
  };
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

  return { accessToken: signAccessToken(user.id) };
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
  await updateUser(userId, { passwordHash });
  await deletePasswordOtp(userId);
  await deleteAllRefreshTokensByUser(userId);

  return { message: "Password changed successfully. Please login again." };
};

export const updateProfile = async ({ userId, data }) => {
  const { fullName, phone, avatarUrl } = data;
  return updateUser(userId, {
    ...(fullName !== undefined && { fullName }),
    ...(phone !== undefined && { phone }),
    ...(avatarUrl !== undefined && { avatarUrl }),
  });
};
