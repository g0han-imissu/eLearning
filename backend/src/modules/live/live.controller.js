import * as liveService from "./live.service.js";

export const listSessionsByClass = async (req, res, next) => {
  try {
    res.json(await liveService.listSessionsByClass({ classId: req.params.classId, query: req.query }));
  } catch (e) { next(e); }
};

export const createLiveSession = async (req, res, next) => {
  try { res.status(201).json(await liveService.createLiveSession({ body: req.body, user: req.user })); } catch (e) { next(e); }
};

export const joinSession = async (req, res, next) => {
  try { res.json(await liveService.joinSession({ sessionId: req.params.sessionId, user: req.user })); } catch (e) { next(e); }
};

export const markAttendance = async (req, res, next) => {
  try { res.json(await liveService.markAttendance({ body: req.body, user: req.user })); } catch (e) { next(e); }
};
