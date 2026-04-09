const liveService = require("./live.service");

// req.params.classId lấy từ URL: GET /live/sessions/:classId
const listSessionsByClass = async (req, res, next) => {
  try {
    const result = await liveService.listSessionsByClass({
      classId: req.params.classId,
      query: req.query,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createLiveSession = async (req, res, next) => {
  try {
    const session = await liveService.createLiveSession({ body: req.body, user: req.user });
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const item = await liveService.markAttendance({ body: req.body, user: req.user });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

module.exports = { listSessionsByClass, createLiveSession, markAttendance };
