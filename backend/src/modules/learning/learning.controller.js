import * as learningService from "./learning.service.js";

export const listPrograms = async (req, res, next) => {
  try { res.json(await learningService.listPrograms(req.query)); } catch (e) { next(e); }
};
export const listCourses = async (req, res, next) => {
  try { res.json(await learningService.listCourses(req.query)); } catch (e) { next(e); }
};
export const listClasses = async (req, res, next) => {
  try { res.json(await learningService.listClasses(req.query)); } catch (e) { next(e); }
};
export const createProgram = async (req, res, next) => {
  try { res.status(201).json(await learningService.createProgram(req.body)); } catch (e) { next(e); }
};
export const createCourse = async (req, res, next) => {
  try { res.status(201).json(await learningService.createCourse(req.body)); } catch (e) { next(e); }
};
export const createClass = async (req, res, next) => {
  try { res.status(201).json(await learningService.createClass({ body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const enrollClass = async (req, res, next) => {
  try {
    const { classId, studentId } = req.body;
    res.status(201).json(await learningService.enrollClass({ classId, studentId, user: req.user }));
  } catch (e) { next(e); }
};
export const getProgram = async (req, res, next) => {
  try { res.json(await learningService.getProgram(req.params.id)); } catch (e) { next(e); }
};
export const updateProgram = async (req, res, next) => {
  try { res.json(await learningService.updateProgram(req.params.id, req.body)); } catch (e) { next(e); }
};
export const deleteProgram = async (req, res, next) => {
  try { await learningService.deleteProgram(req.params.id); res.status(204).send(); } catch (e) { next(e); }
};
export const getCourse = async (req, res, next) => {
  try { res.json(await learningService.getCourse(req.params.id)); } catch (e) { next(e); }
};
export const updateCourse = async (req, res, next) => {
  try { res.json(await learningService.updateCourse(req.params.id, req.body)); } catch (e) { next(e); }
};
export const deleteCourse = async (req, res, next) => {
  try { await learningService.deleteCourse(req.params.id); res.status(204).send(); } catch (e) { next(e); }
};
export const getClass = async (req, res, next) => {
  try { res.json(await learningService.getClass(req.params.id)); } catch (e) { next(e); }
};
export const updateClass = async (req, res, next) => {
  try { res.json(await learningService.updateClass(req.params.id, req.body)); } catch (e) { next(e); }
};
export const deleteClass = async (req, res, next) => {
  try { await learningService.deleteClass(req.params.id); res.status(204).send(); } catch (e) { next(e); }
};

export const getCourseTeachers = async (req, res, next) => {
  try { res.json(await learningService.getTeachersByCourse(req.params.id)); } catch (e) { next(e); }
};
