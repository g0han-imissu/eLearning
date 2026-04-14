import prisma from "../../lib/prisma.js";

export const findQuizById = (id) =>
  prisma.quiz.findUnique({
    where: { id },
    include: {
      content: { include: { module: { include: { lecture: true } } } },
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { answers: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

export const updateQuiz = (id, data) => prisma.quiz.update({ where: { id }, data });

export const createQuestion = (data) =>
  prisma.question.create({ data, include: { answers: true } });

export const findQuestionById = (id) =>
  prisma.question.findUnique({
    where: { id },
    include: {
      quiz: { include: { content: { include: { module: { include: { lecture: true } } } } } },
      answers: true,
    },
  });

export const updateQuestion = (id, data) =>
  prisma.question.update({ where: { id }, data, include: { answers: true } });

export const deleteQuestion = (id) => prisma.question.delete({ where: { id } });

export const createAnswer = (data) => prisma.answer.create({ data });

export const findAnswerById = (id) =>
  prisma.answer.findUnique({
    where: { id },
    include: {
      question: {
        include: {
          quiz: { include: { content: { include: { module: { include: { lecture: true } } } } } },
        },
      },
    },
  });

export const updateAnswer = (id, data) => prisma.answer.update({ where: { id }, data });
export const deleteAnswer = (id) => prisma.answer.delete({ where: { id } });
