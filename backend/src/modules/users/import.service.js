import prisma, { prismaAdmin } from "../../lib/prisma.js";
import ApiError from "../../utils/apiError.js";
import { parseSpreadsheet, provisionUsers } from "./provision.service.js";

export const importFromFile = async ({ file, type, dryRun, atomic, reqUser }) => {
  if (!file) throw new ApiError(400, "Chưa chọn file");
  if (!["TEACHER", "STUDENT"].includes(type)) throw new ApiError(400, "type phải là TEACHER hoặc STUDENT");

  const { dtos, rawRows, source } = parseSpreadsheet(file.buffer, file.originalname);
  return provisionUsers({
    type, source,
    fileName: file.originalname,
    dtos, rawRows, dryRun, atomic, reqUser,
  });
};

// Tạo thủ công 1 user — đi qua đúng pipeline import (source MANUAL) để có audit + credentials
export const createSingleUser = async ({ data, reqUser }) => {
  const { role, ...dto } = data;
  if (!["TEACHER", "STUDENT"].includes(role)) throw new ApiError(400, "role phải là TEACHER hoặc STUDENT");
  if (!dto.email && !dto.userCode) throw new ApiError(400, "Cần ít nhất email hoặc mã người dùng");

  const result = await provisionUsers({
    type: role, source: "MANUAL", dtos: [dto], reqUser,
  });

  const row = result.rows[0];
  if (row.status === "ERROR") throw new ApiError(400, row.errorMessage);

  // Trả credentials 1 lần cho admin (user không email); dữ liệu vẫn nằm trong import job
  let credentials = null;
  if (result.credentialCount > 0) {
    const saved = await prisma.importRow.findFirst({
      where: { jobId: result.jobId, rowNumber: 1 },
      select: { tempPassword: true },
    });
    credentials = { username: row.username, tempPassword: saved?.tempPassword };
  }

  return {
    message: dto.email
      ? "Đã tạo tài khoản, email kích hoạt đã được gửi (nếu cấu hình email hợp lệ)."
      : "Đã tạo tài khoản. Lưu lại thông tin đăng nhập bên dưới để cấp cho người dùng.",
    jobId: result.jobId,
    userId: row.createdUserId,
    username: row.username,
    credentials,
    emailFailedCount: result.emailFailedCount,
  };
};

export const listImportJobs = () =>
  prisma.importJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { createdBy: { select: { id: true, fullName: true } } },
  });

export const getImportJob = async (id) => {
  const job = await prisma.importJob.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, fullName: true } },
      rows: { orderBy: { rowNumber: "asc" }, omit: { tempPassword: true } },
    },
  });
  if (!job) throw new ApiError(404, "Import job not found");
  return job;
};

// CSV credentials: chỉ các dòng SUCCESS còn giữ mật khẩu tạm (user không email)
export const getJobCredentialsCsv = async (id) => {
  const job = await prisma.importJob.findUnique({
    where: { id },
    include: { rows: { where: { status: "SUCCESS", tempPassword: { not: null } }, orderBy: { rowNumber: "asc" } } },
  });
  if (!job) throw new ApiError(404, "Import job not found");
  if (job.rows.length === 0) {
    throw new ApiError(404, "Không còn thông tin đăng nhập nào (đã bị thu hồi hoặc người dùng đã đổi mật khẩu)");
  }

  const userIds = job.rows.map((r) => r.createdUserId).filter(Boolean);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, userCode: true, fullName: true, username: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = ["userCode,fullName,username,tempPassword"];
  for (const r of job.rows) {
    const u = byId.get(r.createdUserId);
    if (!u) continue;
    lines.push([esc(u.userCode), esc(u.fullName), esc(u.username), esc(r.tempPassword)].join(","));
  }
  // BOM để Excel mở tiếng Việt không lỗi font
  return "﻿" + lines.join("\r\n");
};

export const wipeJobCredentials = async (id) => {
  const job = await prisma.importJob.findUnique({ where: { id }, select: { id: true } });
  if (!job) throw new ApiError(404, "Import job not found");
  const { count } = await prismaAdmin.importRow.updateMany({
    where: { jobId: id, tempPassword: { not: null } },
    data: { tempPassword: null },
  });
  return { message: `Đã thu hồi ${count} mật khẩu tạm.` };
};

export const rollbackJob = async (id) => {
  const job = await prisma.importJob.findUnique({
    where: { id },
    include: { rows: { where: { status: "SUCCESS", createdUserId: { not: null } } } },
  });
  if (!job) throw new ApiError(404, "Import job not found");
  if (job.status === "ROLLED_BACK") throw new ApiError(400, "Job này đã được hoàn tác");

  const createdIds = job.rows.map((r) => r.createdUserId);

  // Chỉ xóa user chưa từng hoạt động: chưa đăng nhập (không refresh token)
  // và chưa tự đổi mật khẩu / kích hoạt
  const deletable = await prisma.user.findMany({
    where: {
      id: { in: createdIds },
      refreshTokens: { none: {} },
      taughtClasses: { none: {} },
      ownedLectures: { none: {} },
      OR: [{ mustChangePassword: true }, { status: "PENDING" }],
    },
    select: { id: true },
  });
  const deletableIds = deletable.map((u) => u.id);
  const skipped = createdIds.length - deletableIds.length;

  await prismaAdmin.$transaction([
    prismaAdmin.user.deleteMany({ where: { id: { in: deletableIds } } }),
    prismaAdmin.importRow.updateMany({
      where: { jobId: id, createdUserId: { in: deletableIds } },
      data: { status: "ROLLED_BACK", tempPassword: null },
    }),
    prismaAdmin.importJob.update({
      where: { id },
      data: { status: "ROLLED_BACK", completedAt: new Date() },
    }),
  ]);

  return {
    message: `Đã hoàn tác: xóa ${deletableIds.length} tài khoản.` +
      (skipped > 0 ? ` ${skipped} tài khoản đã có hoạt động (đăng nhập/đổi mật khẩu) nên được giữ lại.` : ""),
    deleted: deletableIds.length,
    skipped,
  };
};

export const getImportTemplate = (type) => {
  if (type === "STUDENT") {
    return "﻿userCode,fullName,email,phone,programCode,classCode\r\nSV001,Nguyễn Văn A,sva@example.com,0912345678,CNTT,LOP01\r\nSV002,Trần Thị B,,,CNTT,LOP01\r\n";
  }
  return "﻿userCode,fullName,email,phone,department\r\nGV001,Nguyễn Văn A,gva@example.com,0912345678,Khoa CNTT\r\nGV002,Trần Thị B,,,Khoa Toán\r\n";
};
