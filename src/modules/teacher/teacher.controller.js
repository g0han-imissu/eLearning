import * as teacherService from "./teacher.service.js";

export const listMyTeachingClasses = async (req, res, next) => {
  try { res.json(await teacherService.listMyTeachingClasses(req.user.id)); } catch (e) { next(e); }
};

export const listStudentsByClass = async (req, res, next) => {
  try {
    res.json(await teacherService.listStudentsByClass({ classId: req.params.classId, userId: req.user.id }));
  } catch (e) { next(e); }
};
