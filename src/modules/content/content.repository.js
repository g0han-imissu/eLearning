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

module.exports = {
  createLecture,
  findLectureById,
  createModule,
  findModuleWithLecture,
  createContent,
  createVideo,
  createDocument,
  createQuiz,
};
