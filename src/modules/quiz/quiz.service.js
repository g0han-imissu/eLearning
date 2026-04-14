import ApiError from "../../utils/apiError.js";
import * as repo from "./quiz.repository.js";

const assertCanEdit = (lecture, user) => {
  if (!user.roles.includes("ADMIN") && lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture");
  }
};

export const getQuiz = async (id) => {
  const quiz = await repo.findQuizById(id);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  return quiz;
};

export const updateQuiz = async ({ id, body, user }) => {
  const quiz = await repo.findQuizById(id);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  assertCanEdit(quiz.content.module.lecture, user);
  return repo.updateQuiz(id, body);
};

export const createQuestion = async ({ body, user }) => {
  const quiz = await repo.findQuizById(body.quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  assertCanEdit(quiz.content.module.lecture, user);
  return repo.createQuestion(body);
};

export const updateQuestion = async ({ id, body, user }) => {
  const question = await repo.findQuestionById(id);
  if (!question) throw new ApiError(404, "Question not found");
  assertCanEdit(question.quiz.content.module.lecture, user);
  return repo.updateQuestion(id, body);
};

export const deleteQuestion = async ({ id, user }) => {
  const question = await repo.findQuestionById(id);
  if (!question) throw new ApiError(404, "Question not found");
  assertCanEdit(question.quiz.content.module.lecture, user);
  return repo.deleteQuestion(id);
};

export const createAnswer = async ({ body, user }) => {
  const question = await repo.findQuestionById(body.questionId);
  if (!question) throw new ApiError(404, "Question not found");
  assertCanEdit(question.quiz.content.module.lecture, user);
  return repo.createAnswer(body);
};

export const updateAnswer = async ({ id, body, user }) => {
  const answer = await repo.findAnswerById(id);
  if (!answer) throw new ApiError(404, "Answer not found");
  assertCanEdit(answer.question.quiz.content.module.lecture, user);
  return repo.updateAnswer(id, body);
};

export const deleteAnswer = async ({ id, user }) => {
  const answer = await repo.findAnswerById(id);
  if (!answer) throw new ApiError(404, "Answer not found");
  assertCanEdit(answer.question.quiz.content.module.lecture, user);
  return repo.deleteAnswer(id);
};
