const prisma = require("../../lib/prisma");

const createLecture = (data) => prisma.lecture.create({ data });

const findLectureById = (id) => prisma.lecture.findUnique({ where: { id } });

const findLectures = ({ skip, take }) =>
  prisma.$transaction([
    prisma.lecture.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        owner: { omit: { passwordHash: true } },
        modules: {
          orderBy: { orderIndex: "asc" },
          include: { contents: { orderBy: { orderIndex: "asc" } } },
        },
      },
    }),
    prisma.lecture.count(),
  ]);

// Kiểm tra teacher có đang dạy ít nhất 1 lớp của course này không
const findClassByTeacherAndCourse = (teacherId, courseId) =>
  prisma.class.findFirst({ where: { teacherId, courseId } });

const createModule = (data) => prisma.module.create({ data });

const findModuleWithLecture = (id) =>
  prisma.module.findUnique({
    where: { id },
    include: { lecture: true },
  });

// Tạo content và media (video/document/quiz) trong 1 transaction
// Nếu tạo media lỗi → content cũng bị hoàn tác, không để lại content "trống"
const createContentWithMedia = ({ type, moduleId, title, orderIndex, payload }) =>
  prisma.$transaction(async (tx) => {
    const content = await tx.content.create({
      data: { type, moduleId, title, orderIndex },
    });

    if (type === "VIDEO") {
      await tx.video.create({ data: { contentId: content.id, ...payload } });
    } else if (type === "DOCUMENT") {
      await tx.document.create({ data: { contentId: content.id, ...payload } });
    } else if (type === "QUIZ") {
      await tx.quiz.create({ data: { contentId: content.id, title: payload.title } });
    }

    return content;
  });

module.exports = {
  createLecture,
  findLectureById,
  findLectures,
  findClassByTeacherAndCourse,
  createModule,
  findModuleWithLecture,
  createContentWithMedia,
};
