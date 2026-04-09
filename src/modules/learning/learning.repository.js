const prisma = require("../../lib/prisma");

const createProgram = (data) => prisma.program.create({ data });

const createCourse = (data) => prisma.course.create({ data });

const createClass = (data) => prisma.class.create({ data });

const upsertEnrollment = ({ classId, studentId }) =>
  prisma.enrollment.upsert({
    where: { classId_studentId: { classId, studentId } },
    create: { classId, studentId },
    update: { status: "ENROLLED" },
  });

module.exports = { createProgram, createCourse, createClass, upsertEnrollment };
