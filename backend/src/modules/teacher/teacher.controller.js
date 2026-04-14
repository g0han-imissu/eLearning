import * as teacherService from "./teacher.service.js";

export const listMyTeachingClasses = async (req, res, next) => {
  try { res.json(await teacherService.listMyTeachingClasses(req.user.id)); } catch (e) { next(e); }
};

export const listStudentsByClass = async (req, res, next) => {
  try {
    res.json(await teacherService.listStudentsByClass({ classId: req.params.classId, userId: req.user.id }));
  } catch (e) { next(e); }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    res.json(await teacherService.getPendingRequests({ classId: req.params.classId, userId: req.user.id }));
  } catch (e) { next(e); }
};

export const approveOrRejectRequest = async (req, res, next) => {
  try {
    const { studentId, action } = req.body;
    res.json(await teacherService.approveOrRejectRequest({
      classId: req.params.classId, studentId, action, userId: req.user.id,
    }));
  } catch (e) { next(e); }
};
