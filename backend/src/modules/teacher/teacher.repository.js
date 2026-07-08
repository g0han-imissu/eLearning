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
  prisma.class.findFirst({ where: teacherId ? { id: classId, teacherId } : { id: classId } });

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

export const findTeacherCourses = (teacherId) =>
  prisma.teacherCourse.findMany({
    where: { teacherId },
    include: { course: { include: { program: true } } },
  });

export const replaceTeacherCourses = (teacherId, courseIds) =>
  prisma.$transaction(async (tx) => {
    await tx.teacherCourse.deleteMany({ where: { teacherId } });
    if (courseIds.length > 0) {
      await tx.teacherCourse.createMany({
        data: courseIds.map((courseId) => ({ teacherId, courseId })),
        skipDuplicates: true,
      });
    }
    return tx.teacherCourse.findMany({
      where: { teacherId },
      include: { course: { include: { program: true } } },
    });
  });

export const findTeacherProfile = (teacherId) =>
  prisma.user.findUnique({
    where: { id: teacherId },
    omit: { passwordHash: true },
    include: {
      roles: { include: { role: true } },
      teacherCourses: { include: { course: { include: { program: true } } } },
    },
  });
