import prisma from "../../lib/prisma.js";

export const createLecture = (data) => prisma.lecture.create({ data });

export const findLectureById = (id) => prisma.lecture.findUnique({ where: { id } });

export const findLectures = ({ skip, take, where = {} }) =>
  prisma.$transaction([
    prisma.lecture.findMany({
      skip, take,
      where,
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        owner: { omit: { passwordHash: true } },
        modules: {
          orderBy: { orderIndex: "asc" },
          include: {
            contents: {
              orderBy: { orderIndex: "asc" },
              include: { video: true, document: true, quiz: true },
            },
          },
        },
      },
    }),
    prisma.lecture.count({ where }),
  ]);

export const findClassByTeacherAndCourse = (teacherId, courseId) =>
  prisma.class.findFirst({ where: { teacherId, courseId } });

export const createModule = (data) => prisma.module.create({ data });

export const findModuleWithLecture = (id) =>
  prisma.module.findUnique({ where: { id }, include: { lecture: true } });

export const createContentWithMedia = ({ type, moduleId, title, orderIndex, payload }) =>
  prisma.$transaction(async (tx) => {
    const content = await tx.content.create({ data: { type, moduleId, title, orderIndex } });
    if (type === "VIDEO") {
      await tx.video.create({ data: { contentId: content.id, ...payload } });
    } else if (type === "DOCUMENT") {
      await tx.document.create({ data: { contentId: content.id, ...payload } });
    } else if (type === "QUIZ") {
      await tx.quiz.create({ data: { contentId: content.id, title: payload.title } });
    }
    return content;
  });

export const findLectureWithModules = (id) =>
  prisma.lecture.findUnique({
    where: { id },
    include: {
      course: true,
      owner: { omit: { passwordHash: true } },
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          contents: {
            orderBy: { orderIndex: "asc" },
            include: { video: true, document: true, quiz: true },
          },
        },
      },
    },
  });

export const updateLecture = (id, data) => prisma.lecture.update({ where: { id }, data });
export const deleteLecture = (id) => prisma.lecture.delete({ where: { id } });

export const findModuleById = (id) =>
  prisma.module.findUnique({
    where: { id },
    include: {
      contents: {
        orderBy: { orderIndex: "asc" },
        include: { video: true, document: true, quiz: true },
      },
    },
  });

export const updateModule = (id, data) => prisma.module.update({ where: { id }, data });
export const deleteModule = (id) => prisma.module.delete({ where: { id } });

export const findContentById = (id) =>
  prisma.content.findUnique({ where: { id }, include: { video: true, document: true, quiz: true } });

export const updateContent = (id, data) => prisma.content.update({ where: { id }, data });
export const deleteContent = (id) => prisma.content.delete({ where: { id } });
