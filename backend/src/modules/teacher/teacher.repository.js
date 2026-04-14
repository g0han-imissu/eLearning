import prisma from "../../lib/prisma.js";

export const findClassesByTeacher = (teacherId) =>
  prisma.class.findMany({
    where: { teacherId },
    include: {
      course: { include: { program: true } },
      _count: { select: { enrollments: true, liveSessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const findAssignedClass = (classId, teacherId) =>
  prisma.class.findFirst({ where: { id: classId, teacherId } });

export const findEnrollmentsByClass = (classId) =>
  prisma.enrollment.findMany({
    where: { classId },
    include: { student: { select: { id: true, email: true, fullName: true, status: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

export const findPendingRequests = (classId) =>
  prisma.enrollment.findMany({
    where: { classId, status: 'PENDING' },
    include: { student: { select: { id: true, email: true, fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });

export const updateEnrollmentStatus = (classId, studentId, status) =>
  prisma.enrollment.update({
    where: { classId_studentId: { classId, studentId } },
    data: { status },
  });
