import prisma from "../../lib/prisma.js";

export const createProgram = (data) => prisma.program.create({ data });
export const createCourse = (data) => prisma.course.create({ data });
export const createClass = (data) => prisma.class.create({ data });

export const upsertEnrollment = ({ classId, studentId }) =>
  prisma.enrollment.upsert({
    where: { classId_studentId: { classId, studentId } },
    create: { classId, studentId },
    update: { status: "ENROLLED" },
  });

export const findPrograms = ({ skip, take }) =>
  prisma.$transaction([
    prisma.program.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
    prisma.program.count(),
  ]);

export const findCourses = ({ skip, take }) =>
  prisma.$transaction([
    prisma.course.findMany({ skip, take, orderBy: { createdAt: "desc" }, include: { program: true } }),
    prisma.course.count(),
  ]);

export const findClasses = ({ skip, take }) =>
  prisma.$transaction([
    prisma.class.findMany({
      skip, take,
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        teacher: { omit: { passwordHash: true } },
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.class.count(),
  ]);

export const findProgramById = (id) =>
  prisma.program.findUnique({ where: { id }, include: { courses: true } });

export const updateProgram = (id, data) => prisma.program.update({ where: { id }, data });
export const deleteProgram = (id) => prisma.program.delete({ where: { id } });

export const findCourseById = (id) =>
  prisma.course.findUnique({ where: { id }, include: { program: true, classes: true } });

export const updateCourse = (id, data) => prisma.course.update({ where: { id }, data });
export const deleteCourse = (id) => prisma.course.delete({ where: { id } });

export const findClassById = (id) =>
  prisma.class.findUnique({
    where: { id },
    include: {
      course: true,
      teacher: { omit: { passwordHash: true } },
      _count: { select: { enrollments: true } },
    },
  });

export const updateClass = (id, data) => prisma.class.update({ where: { id }, data });
export const deleteClass = (id) => prisma.class.delete({ where: { id } });
