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

// skip = bỏ qua bao nhiêu bản ghi (dùng để nhảy trang)
// take = lấy bao nhiêu bản ghi (kích thước 1 trang)
const findPrograms = ({ skip, take }) =>
  prisma.$transaction([
    prisma.program.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
    prisma.program.count(),
  ]);

const findCourses = ({ skip, take }) =>
  prisma.$transaction([
    prisma.course.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { program: true },
    }),
    prisma.course.count(),
  ]);

const findClasses = ({ skip, take }) =>
  prisma.$transaction([
    prisma.class.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        teacher: { omit: { passwordHash: true } },
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.class.count(),
  ]);

module.exports = {
  createProgram,
  createCourse,
  createClass,
  upsertEnrollment,
  findPrograms,
  findCourses,
  findClasses,
};
