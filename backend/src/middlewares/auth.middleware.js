import jwt from "jsonwebtoken";
import { prismaAdmin } from "../lib/prisma.js";
import ApiError from "../utils/apiError.js";
import { jwtSecret } from "../config/env.js";

const authMiddleware = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) throw new ApiError(401, "Missing access token");

    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch {
      throw new ApiError(401, "Invalid or expired token");
    }
    // Chạy trước tenantMiddleware nên chưa có tenant context — dùng prismaAdmin.
    // organizationId luôn lấy từ DB, không tin payload của token.
    const user = await prismaAdmin.user.findUnique({
      where: { id: payload.userId },
      omit: { passwordHash: true },
      include: {
        roles: { include: { role: true } },
        organization: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    if (!user) throw new ApiError(401, "Invalid token");
    if (user.status !== "ACTIVE") throw new ApiError(403, "User is not active");
    if (user.organization && user.organization.status !== "ACTIVE") {
      throw new ApiError(403, "Organization is suspended");
    }
    // Chưa đổi mật khẩu tạm → chỉ được dùng các API /auth (đổi mật khẩu, logout)
    if (user.mustChangePassword && !req.originalUrl.startsWith("/api/auth")) {
      throw new ApiError(403, "MUST_CHANGE_PASSWORD");
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map((x) => x.role.name),
      organizationId: user.organizationId,
      organization: user.organization,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
