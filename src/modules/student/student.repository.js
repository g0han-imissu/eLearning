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
