import { z } from "zod";
import * as authService from "./auth.service.js";

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  classCode: z.string().min(1, "Mã lớp học là bắt buộc"),
});

const loginSchema = z.object({
  email: z.string().min(1), // email hoặc username ("bkhn.gv001")
  password: z.string().min(1),
});

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh({ refreshToken });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken, logoutAll } = req.body;
    const result = await authService.logout({ refreshToken, logoutAll, userId: req.user.id });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const requestChangePassword = async (req, res, next) => {
  try {
    const result = await authService.requestChangePassword({ userId: req.user.id });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

const confirmChangePasswordSchema = z.object({
  otp: z.string().length(6),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const confirmChangePassword = async (req, res, next) => {
  try {
    const { otp, currentPassword, newPassword } = confirmChangePasswordSchema.parse(req.body);
    const result = await authService.confirmChangePassword({
      userId: req.user.id,
      otp,
      currentPassword,
      newPassword,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await authService.updateProfile({ userId: req.user.id, data: req.body });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const result = await authService.verifyEmail({ token });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

const activateAccountSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

// Org Admin được mời qua email: kích hoạt tài khoản + tự đặt mật khẩu
export const activateAccount = async (req, res, next) => {
  try {
    const data = activateAccountSchema.parse(req.body);
    const result = await authService.activateAccount(data);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

const firstPasswordSchema = z.object({ newPassword: z.string().min(6) });

// User được cấp mật khẩu tạm: bắt buộc đổi mật khẩu lần đầu
export const firstChangePassword = async (req, res, next) => {
  try {
    const { newPassword } = firstPasswordSchema.parse(req.body);
    const result = await authService.firstChangePassword({ userId: req.user.id, newPassword });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};
