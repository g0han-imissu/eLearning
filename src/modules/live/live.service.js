const ApiError = require("../../utils/apiError");
const liveRepository = require("./live.repository");

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

module.exports = { createLiveSession, markAttendance };
