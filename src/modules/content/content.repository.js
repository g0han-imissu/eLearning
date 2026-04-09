const prisma = require("../../lib/prisma");

const createLecture = (data) => prisma.lecture.create({ data });

const findLectureById = (id) => prisma.lecture.findUnique({ where: { id } });

const createModule = (data) => prisma.module.create({ data });

const findModuleWithLecture = (id) =>
  prisma.module.findUnique({
    where: { id },
    include: { lecture: true },
  });

const createContent = (data) => prisma.content.create({ data });

const createVideo = (data) => prisma.video.create({ data });

const createDocument = (data) => prisma.document.create({ data });

const createQuiz = (data) => prisma.quiz.create({ data });

// Lấy danh sách bài giảng kèm theo modules và contents bên trong
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

module.exports = {
  createLecture,
  findLectureById,
  findLectures,
  createModule,
  findModuleWithLecture,
  createContent,
  createVideo,
  createDocument,
  createQuiz,
};
