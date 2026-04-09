const prisma = require("../../lib/prisma");

const findClassesByTeacher = (teacherId) =>
  prisma.class.findMany({
    where: { teacherId },
    include: {
      course: { include: { program: true } },
      _count: { select: { enrollments: true, liveSessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

const findAssignedClass = (classId, teacherId) =>
  prisma.class.findFirst({
    where: { id: classId, teacherId },
  });

const findEnrollmentsByClass = (classId) =>
  prisma.enrollment.findMany({
    where: { classId },
    include: {
      student: {
        select: { id: true, email: true, fullName: true, status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

module.exports = { findClassesByTeacher, findAssignedClass, findEnrollmentsByClass };
