const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/apiError");
const { jwtSecret, jwtExpiresIn } = require("../../config/env");
const { findUserByEmail, findRoleByName, createUserWithRole } = require("./auth.repository");

const signToken = (userId) => jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });

const register = async ({ email, password, fullName, phone }) => {
  const existed = await findUserByEmail(email);
  if (existed) throw new ApiError(409, "Email already exists");

  const studentRole = await findRoleByName("STUDENT");
  if (!studentRole) throw new ApiError(500, "Missing STUDENT role");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUserWithRole({ email, passwordHash, fullName, phone, roleId: studentRole.id });

  return {
    message: "Register success, waiting admin approval",
    user: { id: user.id, email: user.email, status: user.status },
  };
};

const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");
  if (user.status !== "ACTIVE") throw new ApiError(403, "Account is not active");

  return {
    accessToken: signToken(user.id),
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map((x) => x.role.name),
    },
  };
};

module.exports = { register, login };
