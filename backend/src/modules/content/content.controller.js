import * as contentService from "./content.service.js";

export const listLectures = async (req, res, next) => {
  try { res.json(await contentService.listLectures(req.query, req.user)); } catch (e) { next(e); }
};
export const createLecture = async (req, res, next) => {
  try { res.status(201).json(await contentService.createLecture({ body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const getLecture = async (req, res, next) => {
  try { res.json(await contentService.getLecture(req.params.id, req.user)); } catch (e) { next(e); }
};
export const updateLecture = async (req, res, next) => {
  try { res.json(await contentService.updateLecture({ id: req.params.id, body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const deleteLecture = async (req, res, next) => {
  try { await contentService.deleteLecture({ id: req.params.id, user: req.user }); res.status(204).send(); } catch (e) { next(e); }
};
export const createModule = async (req, res, next) => {
  try { res.status(201).json(await contentService.createModule({ body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const getModule = async (req, res, next) => {
  try { res.json(await contentService.getModule(req.params.id)); } catch (e) { next(e); }
};
export const updateModule = async (req, res, next) => {
  try { res.json(await contentService.updateModule({ id: req.params.id, body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const deleteModule = async (req, res, next) => {
  try { await contentService.deleteModule({ id: req.params.id, user: req.user }); res.status(204).send(); } catch (e) { next(e); }
};
export const createContent = async (req, res, next) => {
  try { res.status(201).json(await contentService.createContent({ body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const getContent = async (req, res, next) => {
  try { res.json(await contentService.getContent(req.params.id)); } catch (e) { next(e); }
};
export const updateContent = async (req, res, next) => {
  try { res.json(await contentService.updateContent({ id: req.params.id, body: req.body, user: req.user })); } catch (e) { next(e); }
};
export const deleteContent = async (req, res, next) => {
  try { await contentService.deleteContent({ id: req.params.id, user: req.user }); res.status(204).send(); } catch (e) { next(e); }
};
