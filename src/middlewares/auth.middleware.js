const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/apiError");
const { jwtSecret } = require("../config/env");

const authMiddleware = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) throw new ApiError(401, "Missing access token");

    const payload = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      omit: { passwordHash: true },
      include: { roles: { include: { role: true } } },
    });

    if (!user) throw new ApiError(401, "Invalid token");
    if (user.status !== "ACTIVE") throw new ApiError(403, "User is not active");

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map((x) => x.role.name),
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
