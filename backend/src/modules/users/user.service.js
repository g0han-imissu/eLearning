import ApiError from "../../utils/apiError.js";
import prisma from "../../lib/prisma.js";
import { findUsers, updateStatusById, findRolesByNames, replaceUserRoles } from "./user.repository.js";

// ORG_ADMIN chỉ được gán các role trong tổ chức — không bao giờ SUPER_ADMIN
const ASSIGNABLE_ROLES = new Set(["ORG_ADMIN", "TEACHER", "STUDENT"]);

// UserRole không có organizationId nên không được extension scope —
// phải xác nhận user thuộc org hiện tại trước khi thao tác
const assertUserInOrg = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) throw new ApiError(404, "User not found");
};

export const listUsers = () => findUsers();

export const updateUserStatus = async ({ id, status }) => {
  // Không còn bước "duyệt": PENDING = chưa kích hoạt qua email, tự thành ACTIVE
  // khi user đặt mật khẩu. Admin chỉ được vô hiệu / kích hoạt lại tài khoản.
  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    throw new ApiError(400, "Trạng thái chỉ có thể là ACTIVE hoặc INACTIVE");
  }
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!user) throw new ApiError(404, "User not found");
  if (user.status === "PENDING") {
    throw new ApiError(400, "Tài khoản chưa được kích hoạt qua email — người dùng phải tự đặt mật khẩu qua link mời.");
  }
  return updateStatusById(id, status);
};

export const assignRoles = async ({ id, roleNames }) => {
  await assertUserInOrg(id);

  const invalid = (roleNames || []).filter((name) => !ASSIGNABLE_ROLES.has(name));
  if (invalid.length) throw new ApiError(400, `Không thể gán role: ${invalid.join(", ")}`);

  const roles = await findRolesByNames(roleNames);
  await replaceUserRoles(id, roles.map((role) => ({ userId: id, roleId: role.id })));
  return { message: "Roles updated" };
};
