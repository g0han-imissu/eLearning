const learningService = require("./learning.service");

const createProgram = async (req, res, next) => {
  try {
    const program = await learningService.createProgram(req.body);
    res.status(201).json(program);
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const course = await learningService.createCourse(req.body);
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const classItem = await learningService.createClass({ body: req.body, user: req.user });
    res.status(201).json(classItem);
  } catch (error) {
    next(error);
  }
};

const enrollClass = async (req, res, next) => {
  try {
    const { classId, studentId } = req.body;
    const enrollment = await learningService.enrollClass({ classId, studentId, user: req.user });
    res.status(201).json(enrollment);
  } catch (error) {
    next(error);
  }
};

module.exports = { createProgram, createCourse, createClass, enrollClass };
