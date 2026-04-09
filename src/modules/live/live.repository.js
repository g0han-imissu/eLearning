const prisma = require("../../lib/prisma");

const findClassById = (id) => prisma.class.findUnique({ where: { id } });

const createLiveSession = (data) => prisma.liveSession.create({ data });

const findLiveSessionWithClass = (id) =>
  prisma.liveSession.findUnique({
    where: { id },
    include: { class: true },
  });

const upsertAttendance = ({ sessionId, userId, status, joinedAt, durationMin }) =>
  prisma.sessionAttendance.upsert({
    where: { sessionId_userId: { sessionId, userId } },
    create: { sessionId, userId, status, joinedAt, durationMin },
    update: { status, joinedAt, durationMin },
  });

module.exports = { findClassById, createLiveSession, findLiveSessionWithClass, upsertAttendance };
