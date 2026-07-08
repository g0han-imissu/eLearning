import crypto from "crypto";
import bcrypt from "bcryptjs";
import ApiError from "../../utils/apiError.js";
import { clientUrl } from "../../config/env.js";
import { sendOrgApprovedEmail, sendOrgRejectedEmail } from "../../lib/email.js";
import * as repo from "./platform.repository.js";

// "Đại học Bách Khoa" -> "dai-hoc-bach-khoa"
const slugify = (name) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "org";

const uniqueSlug = async (name) => {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; await repo.findOrgBySlug(slug); i++) slug = `${base}-${i}`;
  return slug;
};

// "Đại học Bách Khoa" -> "DHBK" — dùng làm prefix username (bkhn.gv001) và hiển thị cho Org Admin
const orgCodeFrom = (name) => {
  const initials = slugify(name).split("-").map((w) => w[0]).join("").toUpperCase();
  return initials.length >= 2 ? initials.slice(0, 8) : slugify(name).replace(/-/g, "").toUpperCase().slice(0, 8);
};

const uniqueOrgCode = async (name) => {
  const base = orgCodeFrom(name);
  let code = base;
  for (let i = 2; await repo.findOrgByCode(code); i++) code = `${base}${i}`;
  return code;
};

// ===== Public =====

export const submitRegistration = async ({ orgName, contactName, email, phone, expectedUsers, note }) => {
  const pending = await repo.findPendingRequestByEmail(email);
  if (pending) throw new ApiError(409, "Đã có yêu cầu đăng ký đang chờ duyệt với email này.");

  const existedUser = await repo.findUserByEmail(email);
  if (existedUser) throw new ApiError(409, "Email này đã được sử dụng trong hệ thống.");

  await repo.createRegistrationRequest({ orgName, contactName, email, phone, expectedUsers, note });
  return { message: "Yêu cầu đăng ký đã được gửi. Chúng tôi sẽ liên hệ qua email sau khi xét duyệt." };
};

// ===== Super Admin =====

export const listRegistrationRequests = ({ status }) => repo.findRegistrationRequests({ status });

export const getRegistrationRequest = async (id) => {
  const request = await repo.findRegistrationRequestById(id);
  if (!request) throw new ApiError(404, "Registration request not found");
  return request;
};

export const approveRegistration = async ({ requestId, reviewerId }) => {
  const request = await repo.findRegistrationRequestById(requestId);
  if (!request) throw new ApiError(404, "Registration request not found");
  if (request.status !== "PENDING") throw new ApiError(400, "Yêu cầu này đã được xử lý.");

  const existedUser = await repo.findUserByEmail(request.email);
  if (existedUser) throw new ApiError(409, "Email của người đại diện đã tồn tại trong hệ thống.");

  const orgAdminRole = await repo.findRoleByName("ORG_ADMIN");
  if (!orgAdminRole) throw new ApiError(500, "Missing ORG_ADMIN role. Run prisma seed.");

  const slug = await uniqueSlug(request.orgName);
  const code = await uniqueOrgCode(request.orgName);
  const activationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 giờ
  // Mật khẩu ngẫu nhiên không gửi cho ai — user phải đặt mật khẩu qua link kích hoạt
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

  const { organization, request: updated } = await repo.approveRequestTx({
    requestId,
    reviewerId,
    org: {
      name: request.orgName,
      slug,
      code,
      maxUsers: request.expectedUsers ?? null,
    },
    admin: {
      email: request.email,
      fullName: request.contactName,
      phone: request.phone,
      passwordHash,
      roleId: orgAdminRole.id,
    },
    activationToken,
    tokenExpiresAt,
  });

  const activateUrl = `${clientUrl}/activate-account?token=${activationToken}`;
  let emailSent = true;
  try {
    await sendOrgApprovedEmail({
      to: request.email,
      orgName: request.orgName,
      orgCode: code,
      contactName: request.contactName,
      activateUrl,
    });
  } catch (e) {
    emailSent = false;
    console.error("Failed to send approval email:", e.message);
    // Fallback khi SMTP chưa cấu hình: in link ra console để gửi thủ công
    console.log(`[EMAIL FALLBACK] Link kích hoạt cho ${request.email}: ${activateUrl}`);
  }

  return {
    message: emailSent
      ? `Đã duyệt. Organization "${organization.name}" được tạo, email kích hoạt đã gửi tới ${request.email}.`
      : `Đã duyệt và tạo organization "${organization.name}", nhưng GỬI EMAIL THẤT BẠI (kiểm tra EMAIL_USER/EMAIL_PASS trong .env). Link kích hoạt đã in ra console server.`,
    organization,
    request: updated,
  };
};

export const rejectRegistration = async ({ requestId, reviewerId, rejectReason }) => {
  const request = await repo.findRegistrationRequestById(requestId);
  if (!request) throw new ApiError(404, "Registration request not found");
  if (request.status !== "PENDING") throw new ApiError(400, "Yêu cầu này đã được xử lý.");

  const updated = await repo.rejectRequest({ requestId, reviewerId, rejectReason });

  let emailSent = true;
  try {
    await sendOrgRejectedEmail({
      to: request.email,
      orgName: request.orgName,
      contactName: request.contactName,
      reason: rejectReason,
    });
  } catch (e) {
    emailSent = false;
    console.error("Failed to send rejection email:", e.message);
  }

  return {
    message: emailSent
      ? "Đã từ chối yêu cầu, email thông báo đã được gửi."
      : "Đã từ chối yêu cầu, nhưng GỬI EMAIL THẤT BẠI (kiểm tra EMAIL_USER/EMAIL_PASS trong .env).",
    request: updated,
  };
};

export const listOrganizations = () => repo.findOrganizations();

export const getOrganization = async (id) => {
  const org = await repo.findOrganizationById(id);
  if (!org) throw new ApiError(404, "Organization not found");
  return org;
};

export const suspendOrganization = async (id) => {
  await getOrganization(id);
  const org = await repo.updateOrganizationStatus(id, "SUSPENDED");
  return { message: `Đã khóa organization "${org.name}".`, organization: org };
};

export const activateOrganization = async (id) => {
  await getOrganization(id);
  const org = await repo.updateOrganizationStatus(id, "ACTIVE");
  return { message: `Đã mở khóa organization "${org.name}".`, organization: org };
};

export const getPlatformStats = () => repo.platformStats();
