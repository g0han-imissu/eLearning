import prisma from "../../lib/prisma.js";

export const findClassById = (id) => prisma.class.findUnique({ where: { id } });

export const createLiveSession = (data) => prisma.liveSession.create({ data });

export const findLiveSessionWithClass = (id) =>
  prisma.liveSession.findUnique({ where: { id }, include: { class: true } });

export const upsertAttendance = ({ sessionId, userId, status, joinedAt, durationMin }) =>
  prisma.sessionAttendance.upsert({
    where: { sessionId_userId: { sessionId, userId } },
    create: { sessionId, userId, status, joinedAt, durationMin },
    update: { status, joinedAt, durationMin },
  });

export const findSessionsByClass = ({ classId, skip, take }) =>
  prisma.$transaction([
    prisma.liveSession.findMany({
      where: { classId },
      skip, take,
      orderBy: { startAt: "desc" },
      include: { _count: { select: { attendances: true } } },
    }),
    prisma.liveSession.count({ where: { classId } }),
  ]);
