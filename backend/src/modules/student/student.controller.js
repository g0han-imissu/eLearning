import * as studentService from "./student.service.js";

export const me = async (req, res, next) => {
  try { res.json(await studentService.me(req.user.id)); } catch (e) { next(e); }
};
export const myProgress = async (req, res, next) => {
  try { res.json(await studentService.myProgress(req.user.id)); } catch (e) { next(e); }
};
export const submitQuiz = async (req, res, next) => {
  try { res.json(await studentService.submitQuiz({ body: req.body, userId: req.user.id })); } catch (e) { next(e); }
};
export const updateProgress = async (req, res, next) => {
  try { res.json(await studentService.updateProgress({ body: req.body, userId: req.user.id })); } catch (e) { next(e); }
};
