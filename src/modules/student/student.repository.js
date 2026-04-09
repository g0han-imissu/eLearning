const prisma = require("../../lib/prisma");

const findMe = (userId) =>
  prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          class: { include: { course: true } },
        },
      },
    },
  });

const findEnrollmentsByStudent = (studentId) =>
  prisma.enrollment.findMany({
    where: { studentId },
    include: { class: true },
  });

module.exports = { findMe, findEnrollmentsByStudent };
