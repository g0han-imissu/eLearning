const teacherService = require("./teacher.service");

const listMyTeachingClasses = async (req, res, next) => {
  try {
    const classes = await teacherService.listMyTeachingClasses(req.user.id);
    res.json(classes);
  } catch (error) {
    next(error);
  }
};

const listStudentsByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const result = await teacherService.listStudentsByClass({ classId, userId: req.user.id });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { listMyTeachingClasses, listStudentsByClass };
