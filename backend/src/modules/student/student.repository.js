import prisma from "../../lib/prisma.js";

export const findMe = (userId) =>
  prisma.user.findUnique({
    where: { id: userId },
    include: { enrollments: { include: { class: { include: { course: true } } } } },
  });

export const findEnrollmentsByStudent = (studentId) =>
  prisma.enrollment.findMany({ where: { studentId }, include: { class: true } });

export const findQuizWithAnswers = (quizId) =>
  prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { answers: true } } },
  });

export const findEnrollment = (classId, studentId) =>
  prisma.enrollment.findUnique({ where: { classId_studentId: { classId, studentId } } });

export const updateEnrollmentProgress = (classId, studentId, data) =>
  prisma.enrollment.update({ where: { classId_studentId: { classId, studentId } }, data });

// code chỉ unique trong 1 org; extension tự scope theo org của student
export const findClassByCode = (code) =>
  prisma.class.findFirst({ where: { code }, include: { course: true, teacher: { select: { id: true, fullName: true } } } });

export const requestJoinClass = (classId, studentId) =>
  prisma.enrollment.upsert({
    where: { classId_studentId: { classId, studentId } },
    update: {},
    create: { classId, studentId, status: 'PENDING' },
  });

export const findMyEnrollments = (studentId) =>
  prisma.enrollment.findMany({
    where: { studentId, status: { not: 'DROPPED' } },
    include: { class: { include: { course: true, teacher: { select: { id: true, fullName: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
