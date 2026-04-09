const { z } = require("zod");
const authService = require("./auth.service");

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login };
