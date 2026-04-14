import * as quizService from "./quiz.service.js";

export const getQuiz = async (req, res, next) => {
  try { res.json(await quizService.getQuiz(req.params.id)); } catch (e) { next(e); }
};
export const updateQuiz = async (req, res, next) => {
  try { res.json(await quizService.updateQuiz({ id: req.params.id, body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const createQuestion = async (req, res, next) => {
  try { res.status(201).json(await quizService.createQuestion({ body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const updateQuestion = async (req, res, next) => {
  try { res.json(await quizService.updateQuestion({ id: req.params.id, body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const deleteQuestion = async (req, res, next) => {
  try { await quizService.deleteQuestion({ id: req.params.id, user: req.user }); res.status(204).send(); } catch (e) { next(e); }
};
export const createAnswer = async (req, res, next) => {
  try { res.status(201).json(await quizService.createAnswer({ body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const updateAnswer = async (req, res, next) => {
  try { res.json(await quizService.updateAnswer({ id: req.params.id, body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const deleteAnswer = async (req, res, next) => {
  try { await quizService.deleteAnswer({ id: req.params.id, user: req.user }); res.status(204).send(); } catch (e) { next(e); }
};
