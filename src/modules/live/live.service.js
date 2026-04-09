const ApiError = require("../../utils/apiError");
const liveRepository = require("./live.repository");

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};

// Lấy danh sách session của 1 lớp cụ thể
// classId bắt buộc phải có — không cho phép lấy tất cả session của mọi lớp cùng lúc
const listSessionsByClass = async ({ classId, query }) => {
  if (!classId) throw new ApiError(400, "Missing classId");
  const { skip, take, page, limit } = parsePagination(query);
  const [sessions, total] = await liveRepository.findSessionsByClass({ classId, skip, take });
  return { data: sessions, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createLiveSession = async ({ body, user }) => {
  const classItem = await liveRepository.findClassById(body.classId);
  if (!classItem) throw new ApiError(404, "Class not found");

  const isAdmin = user.roles.includes("ADMIN");
  if (!isAdmin && classItem.teacherId !== user.id) {
    throw new ApiError(403, "You can only create session for assigned classes");
  }
  return liveRepository.createLiveSession(body);
};

const markAttendance = async ({ body, user }) => {
  const { sessionId, userId, status, joinedAt, durationMin } = body;
  const session = await liveRepository.findLiveSessionWithClass(sessionId);
  if (!session) throw new ApiError(404, "Session not found");

  const isAdmin = user.roles.includes("ADMIN");
  if (!isAdmin && session.class.teacherId !== user.id) {
    throw new ApiError(403, "You can only update attendance in assigned classes");
  }
  return liveRepository.upsertAttendance({ sessionId, userId, status, joinedAt, durationMin });
};

module.exports = { listSessionsByClass, createLiveSession, markAttendance };
