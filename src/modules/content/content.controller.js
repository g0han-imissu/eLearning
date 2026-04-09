const contentService = require("./content.service");

const listLectures = async (req, res, next) => {
  try {
    const result = await contentService.listLectures(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createLecture = async (req, res, next) => {
  try {
    const lecture = await contentService.createLecture({ body: req.body, user: req.user });
    res.status(201).json(lecture);
  } catch (error) {
    next(error);
  }
};

const createModule = async (req, res, next) => {
  try {
    const moduleItem = await contentService.createModule({ body: req.body, user: req.user });
    res.status(201).json(moduleItem);
  } catch (error) {
    next(error);
  }
};

const createContent = async (req, res, next) => {
  try {
    const content = await contentService.createContent({ body: req.body, user: req.user });
    res.status(201).json(content);
  } catch (error) {
    next(error);
  }
};

module.exports = { listLectures, createLecture, createModule, createContent };
