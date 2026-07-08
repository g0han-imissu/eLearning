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
        class: { include: { course: true } },
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

export const findClassById = (id) => prisma.class.findUnique({ where: { id } });

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
      class: { include: { course: true } },
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

export const deleteContent = (id) => prisma.content.delete({ where: { id } });

export const updateContentWithMedia = ({ id, type, title, orderIndex, payload }) =>
  prisma.$transaction(async (tx) => {
    const data = {};
    if (title !== undefined) data.title = title;
    if (orderIndex !== undefined) data.orderIndex = orderIndex;
    if (Object.keys(data).length > 0) await tx.content.update({ where: { id }, data });

    if (payload) {
      if (type === "VIDEO") {
        await tx.video.upsert({
          where: { contentId: id },
          create: { contentId: id, ...payload },
          update: payload,
        });
      } else if (type === "DOCUMENT") {
        await tx.document.upsert({
          where: { contentId: id },
          create: { contentId: id, ...payload },
          update: payload,
        });
      } else if (type === "QUIZ" && payload.title) {
        await tx.quiz.update({ where: { contentId: id }, data: { title: payload.title } });
      }
    }
    return tx.content.findUnique({ where: { id }, include: { video: true, document: true, quiz: true } });
  });

export const findStudentEnrollmentByClass = (studentId, classId) =>
  prisma.enrollment.findFirst({
    where: {
      studentId,
      classId,
      status: { in: ["ENROLLED", "IN_PROGRESS", "COMPLETED"] },
    },
  });
