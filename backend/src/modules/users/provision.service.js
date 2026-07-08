import crypto from "crypto";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import prisma, { prismaAdmin } from "../../lib/prisma.js";
import ApiError from "../../utils/apiError.js";
import { clientUrl } from "../../config/env.js";
import { sendUserInviteEmail } from "../../lib/email.js";

/* ============ Helpers ============ */

const stripDiacritics = (s) =>
  String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

const normKey = (s) => stripDiacritics(s).toLowerCase().replace(/[^a-z0-9]/g, "");

// Header CSV/Excel linh hoạt: tiếng Việt hoặc tiếng Anh đều nhận
const HEADER_MAP = {
  userCode: ["usercode", "teachercode", "studentcode", "code", "ma", "magv", "masv", "magiangvien", "masinhvien", "manguoidung"],
  fullName: ["fullname", "hoten", "hovaten", "name", "ten"],
  email: ["email", "thudientu"],
  phone: ["phone", "sdt", "sodienthoai", "dienthoai"],
  department: ["department", "khoa", "bomon", "donvi", "phongban"],
  programCode: ["programcode", "program", "chuongtrinh", "machuongtrinh", "nganh"],
  classCode: ["classcode", "class", "lop", "malop"],
};

const mapHeaders = (rawRow) => {
  const dto = {};
  for (const [rawKey, value] of Object.entries(rawRow)) {
    const nk = normKey(rawKey);
    for (const [field, aliases] of Object.entries(HEADER_MAP)) {
      if (aliases.includes(nk)) {
        dto[field] = value === null || value === undefined ? "" : String(value).trim();
        break;
      }
    }
  }
  return dto;
};

export const parseSpreadsheet = (buffer, fileName = "") => {
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    throw new ApiError(400, "Không đọc được file. Chỉ hỗ trợ CSV hoặc Excel (.xlsx/.xls).");
  }
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new ApiError(400, "File không có dữ liệu.");
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  if (rawRows.length === 0) throw new ApiError(400, "File không có dòng dữ liệu nào.");
  if (rawRows.length > 2000) throw new ApiError(400, "Tối đa 2000 dòng mỗi lần import.");

  const source = /\.(xlsx|xls)$/i.test(fileName) ? "XLSX" : "CSV";
  return { dtos: rawRows.map(mapHeaders), rawRows, source };
};

// Bảng chữ tránh nhầm lẫn khi phát mật khẩu trên giấy (không có 0/O, 1/l/I)
const PW_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const generateTempPassword = (len = 10) => {
  const bytes = crypto.randomBytes(len);
  return Array.from(bytes, (b) => PW_ALPHABET[b % PW_ALPHABET.length]).join("");
};

const usernameSlug = (s) => stripDiacritics(s).toLowerCase().replace(/[^a-z0-9]/g, "");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERCODE_RE = /^[A-Za-z0-9._-]+$/;

/* ============ Validate ============ */

// Trả về danh sách lỗi theo dòng + dữ liệu tham chiếu đã resolve (class/program theo org)
export const validateDtos = async ({ dtos, type }) => {
  const errors = []; // { row, field, message }
  const addErr = (i, field, message) => errors.push({ row: i + 1, field, message });

  const seenCodes = new Map();
  const seenEmails = new Map();

  dtos.forEach((d, i) => {
    if (!d.userCode) addErr(i, "userCode", "Thiếu mã người dùng");
    else if (!USERCODE_RE.test(d.userCode)) addErr(i, "userCode", "Mã chỉ gồm chữ, số, dấu . _ -");
    else {
      const key = d.userCode.toLowerCase();
      if (seenCodes.has(key)) addErr(i, "userCode", `Trùng mã với dòng ${seenCodes.get(key) + 1} trong file`);
      else seenCodes.set(key, i);
    }

    if (!d.fullName || d.fullName.length < 2) addErr(i, "fullName", "Thiếu họ tên (tối thiểu 2 ký tự)");

    if (d.email) {
      if (!EMAIL_RE.test(d.email)) addErr(i, "email", "Email sai định dạng");
      else {
        const key = d.email.toLowerCase();
        if (seenEmails.has(key)) addErr(i, "email", `Trùng email với dòng ${seenEmails.get(key) + 1} trong file`);
        else seenEmails.set(key, i);
      }
    }
  });

  // Check trùng với DB (mỗi loại 1 query)
  const codes = dtos.map((d) => d.userCode).filter(Boolean);
  const emails = dtos.map((d) => d.email).filter(Boolean);

  const [existingByCode, existingByEmail] = await Promise.all([
    codes.length
      ? prisma.user.findMany({ where: { userCode: { in: codes } }, select: { userCode: true } })
      : [],
    emails.length
      ? prismaAdmin.user.findMany({ where: { email: { in: emails } }, select: { email: true } })
      : [],
  ]);
  const codeSet = new Set(existingByCode.map((u) => u.userCode.toLowerCase()));
  const emailSet = new Set(existingByEmail.map((u) => u.email.toLowerCase()));

  dtos.forEach((d, i) => {
    if (d.userCode && codeSet.has(d.userCode.toLowerCase()))
      addErr(i, "userCode", "Mã người dùng đã tồn tại trong tổ chức");
    if (d.email && emailSet.has(d.email.toLowerCase()))
      addErr(i, "email", "Email đã được sử dụng trong hệ thống");
  });

  // Student: resolve programCode / classCode trong org (client đã scope)
  let classMap = new Map();
  let programMap = new Map();
  if (type === "STUDENT") {
    const classCodes = [...new Set(dtos.map((d) => d.classCode).filter(Boolean))];
    const programCodes = [...new Set(dtos.map((d) => d.programCode).filter(Boolean))];
    const [classes, programs] = await Promise.all([
      classCodes.length
        ? prisma.class.findMany({ where: { code: { in: classCodes } }, select: { id: true, code: true, status: true } })
        : [],
      programCodes.length
        ? prisma.program.findMany({ where: { code: { in: programCodes } }, select: { id: true, code: true } })
        : [],
    ]);
    classMap = new Map(classes.map((c) => [c.code, c]));
    programMap = new Map(programs.map((p) => [p.code, p]));

    dtos.forEach((d, i) => {
      if (d.classCode && !classMap.has(d.classCode))
        addErr(i, "classCode", `Không tìm thấy lớp "${d.classCode}" trong tổ chức`);
      if (d.programCode && !programMap.has(d.programCode))
        addErr(i, "programCode", `Không tìm thấy chương trình "${d.programCode}" trong tổ chức`);
    });
  }

  return { errors, classMap, programMap };
};

/* ============ Username ============ */

// username = <orgCode>.<userCode> — unique toàn cục vì đã chứa mã tổ chức
const buildUsernames = async (orgCode, dtos) => {
  const prefix = usernameSlug(orgCode);
  const candidates = dtos.map((d) => (d.userCode ? `${prefix}.${usernameSlug(d.userCode)}` : null));

  const taken = new Set(
    (
      await prismaAdmin.user.findMany({
        where: { username: { in: candidates.filter(Boolean) } },
        select: { username: true },
      })
    ).map((u) => u.username)
  );

  const used = new Set();
  return candidates.map((base) => {
    if (!base) return null;
    let name = base;
    for (let i = 2; taken.has(name) || used.has(name); i++) name = `${base}-${i}`;
    used.add(name);
    return name;
  });
};

/* ============ Provision (lõi dùng chung cho CSV/XLSX/thủ công/SIS sau này) ============ */

export const provisionUsers = async ({
  type,            // "TEACHER" | "STUDENT"
  source,          // CSV | XLSX | MANUAL | API
  fileName,
  dtos,            // UserProvisionDTO[]
  rawRows,         // dữ liệu gốc để lưu audit (mặc định = dtos)
  dryRun = false,
  atomic = false,
  reqUser,         // req.user (org admin)
}) => {
  const org = await prismaAdmin.organization.findUnique({ where: { id: reqUser.organizationId } });
  if (!org) throw new ApiError(500, "Organization not found");

  const role = await prismaAdmin.role.findUnique({ where: { name: type } });
  if (!role) throw new ApiError(500, `Missing ${type} role`);

  const { errors, classMap } = await validateDtos({ dtos, type });
  const errorRows = new Set(errors.map((e) => e.row));

  const report = {
    totalRows: dtos.length,
    validRows: dtos.length - errorRows.size,
    errorRows: errorRows.size,
    errors,
  };

  if (dryRun) return { dryRun: true, ...report };
  if (atomic && errors.length > 0) {
    throw new ApiError(400, `Chế độ atomic: file có ${errorRows.size} dòng lỗi, không import dòng nào. Sửa file hoặc bỏ chế độ atomic.`);
  }

  const usernames = await buildUsernames(org.code, dtos);
  const raws = rawRows || dtos;
  // User có email không đăng nhập bằng mật khẩu này (phải kích hoạt qua link),
  // nên dùng chung 1 hash ngẫu nhiên — tránh bcrypt hàng nghìn lần
  const lockedHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

  const job = await prisma.importJob.create({
    data: {
      type, source, fileName,
      totalRows: dtos.length,
      createdById: reqUser.id,
    },
  });

  const results = []; // { rowNumber, status, errorMessage, createdUserId, tempPassword, username, dto }
  const invites = []; // gửi email sau khi ghi DB xong

  const processRow = async (tx, dto, i) => {
    const username = usernames[i];
    const hasEmail = Boolean(dto.email);
    const tempPassword = hasEmail ? null : generateTempPassword();
    const passwordHash = tempPassword ? await bcrypt.hash(tempPassword, 10) : lockedHash;

    const user = await tx.user.create({
      data: {
        email: hasEmail ? dto.email : null,
        username,
        userCode: dto.userCode,
        fullName: dto.fullName,
        phone: dto.phone || null,
        department: dto.department || null,
        passwordHash,
        // Có email: PENDING chờ kích hoạt qua link. Không email: ACTIVE + bắt đổi mật khẩu lần đầu
        status: hasEmail ? "PENDING" : "ACTIVE",
        mustChangePassword: !hasEmail,
        organizationId: reqUser.organizationId,
      },
    });
    await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });

    if (type === "STUDENT" && dto.classCode) {
      const cls = classMap.get(dto.classCode);
      await tx.enrollment.create({
        data: { classId: cls.id, studentId: user.id, organizationId: reqUser.organizationId, status: "ENROLLED" },
      });
    }

    if (hasEmail) {
      const token = crypto.randomBytes(32).toString("hex");
      await tx.emailVerification.create({
        data: { userId: user.id, token, expiresAt: new Date(Date.now() + 72 * 3600 * 1000) },
      });
      invites.push({ to: dto.email, fullName: dto.fullName, username, token, userId: user.id });
    }

    return { user, username, tempPassword };
  };

  const runRow = async (dto, i) => {
    const rowNumber = i + 1;
    if (errorRows.has(rowNumber)) {
      const msgs = errors.filter((e) => e.row === rowNumber).map((e) => `${e.field}: ${e.message}`).join("; ");
      results.push({ rowNumber, status: "ERROR", errorMessage: msgs, dto });
      return;
    }
    try {
      const { user, username, tempPassword } = await prisma.$transaction((tx) => processRow(tx, dto, i));
      results.push({ rowNumber, status: "SUCCESS", createdUserId: user.id, tempPassword, username, dto });
    } catch (e) {
      results.push({ rowNumber, status: "ERROR", errorMessage: e.message?.slice(0, 500), dto });
    }
  };

  if (atomic) {
    // Tất cả hoặc không gì cả: một transaction duy nhất
    try {
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < dtos.length; i++) {
          const { user, username, tempPassword } = await processRow(tx, dtos[i], i);
          results.push({ rowNumber: i + 1, status: "SUCCESS", createdUserId: user.id, tempPassword, username, dto: dtos[i] });
        }
      }, { timeout: 120000 });
    } catch (e) {
      await prisma.importJob.update({ where: { id: job.id }, data: { status: "FAILED", completedAt: new Date() } });
      throw new ApiError(400, `Import thất bại, đã hoàn tác toàn bộ: ${e.message?.slice(0, 300)}`);
    }
  } else {
    for (let i = 0; i < dtos.length; i++) await runRow(dtos[i], i);
  }

  // Gửi email mời (không chặn kết quả; lỗi gửi ghi vào row nhưng row vẫn SUCCESS)
  const emailFailures = new Map();
  await Promise.allSettled(
    invites.map(async (inv) => {
      try {
        await sendUserInviteEmail({
          to: inv.to,
          fullName: inv.fullName,
          orgName: org.name,
          username: inv.username,
          activateUrl: `${clientUrl}/activate-account?token=${inv.token}`,
        });
      } catch (e) {
        emailFailures.set(inv.userId, `Tài khoản đã tạo nhưng gửi email thất bại: ${e.message?.slice(0, 200)}`);
      }
    })
  );

  const successCount = results.filter((r) => r.status === "SUCCESS").length;
  const errorCount = results.length - successCount;

  await prismaAdmin.$transaction([
    prismaAdmin.importRow.createMany({
      data: results.map((r) => ({
        jobId: job.id,
        rowNumber: r.rowNumber,
        rawData: raws[r.rowNumber - 1] ?? {},
        status: r.status,
        errorMessage: r.errorMessage || emailFailures.get(r.createdUserId) || null,
        createdUserId: r.createdUserId || null,
        tempPassword: r.tempPassword || null,
      })),
    }),
    prismaAdmin.importJob.update({
      where: { id: job.id },
      data: {
        status: errorCount === 0 ? "COMPLETED" : successCount === 0 ? "FAILED" : "COMPLETED_WITH_ERRORS",
        successCount,
        errorCount,
        completedAt: new Date(),
      },
    }),
  ]);

  return {
    jobId: job.id,
    ...report,
    successCount,
    errorCount,
    credentialCount: results.filter((r) => r.tempPassword).length,
    emailInviteCount: invites.length,
    emailFailedCount: emailFailures.size,
    rows: results.map(({ dto, tempPassword, ...r }) => r), // không trả tempPassword trong response import
  };
};
