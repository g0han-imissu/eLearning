import agoraPkg from "agora-token";
const { RtcTokenBuilder, RtcRole } = agoraPkg;
import ApiError from "../../utils/apiError.js";
import { agoraAppId, agoraAppCertificate } from "../../config/env.js";
import * as repo from "./live.repository.js";

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};

export const listSessionsByClass = async ({ classId, query }) => {
  if (!classId) throw new ApiError(400, "Missing classId");
  const { skip, take, page, limit } = parsePagination(query);
  const [sessions, total] = await repo.findSessionsByClass({ classId, skip, take });
  return { data: sessions, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const createLiveSession = async ({ body, user }) => {
  const classItem = await repo.findClassById(body.classId);
  if (!classItem) throw new ApiError(404, "Class not found");
  if (!user.roles.includes("ADMIN") && classItem.teacherId !== user.id) {
    throw new ApiError(403, "You can only create session for assigned classes");
  }
  return repo.createLiveSession(body);
};

// UID nhất quán per user — AI sau này dùng để map mặt với userId
const toAgoraUid = (userId) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (Math.imul(31, hash) + userId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100000 || 1; // 1–99999
};

export const joinSession = async ({ sessionId, user }) => {
  const session = await repo.findLiveSessionWithClass(sessionId);
  if (!session) throw new ApiError(404, "Session not found");

  const isTeacherOrAdmin = user.roles.includes("ADMIN") || user.roles.includes("TEACHER");

  if (!isTeacherOrAdmin) {
    const enrollment = await repo.findEnrollmentByClassAndStudent(session.classId, user.id);
    if (!enrollment) throw new ApiError(403, "You are not enrolled in this class");
  }

  if (!agoraAppId || !agoraAppCertificate) {
    throw new ApiError(500, "Agora is not configured");
  }

  const channelName = sessionId;
  const uid = toAgoraUid(user.id);
  const expireTs = Math.floor(Date.now() / 1000) + 2 * 3600; // 2 giờ

  const token = RtcTokenBuilder.buildTokenWithUid(
    agoraAppId,
    agoraAppCertificate,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    expireTs,
    expireTs,
  );

  await repo.upsertAttendance({
    sessionId,
    userId: user.id,
    status: "PRESENT",
    joinedAt: new Date(),
    durationMin: 0,
    agoraUid: uid,
  });

  return { token, channelName, appId: agoraAppId, uid };
};

export const markAttendance = async ({ body, user }) => {
  const { sessionId, userId, status, joinedAt, durationMin } = body;
  const session = await repo.findLiveSessionWithClass(sessionId);
  if (!session) throw new ApiError(404, "Session not found");
  if (!user.roles.includes("ADMIN") && session.class.teacherId !== user.id) {
    throw new ApiError(403, "You can only update attendance in assigned classes");
  }
  return repo.upsertAttendance({ sessionId, userId, status, joinedAt, durationMin });
};
