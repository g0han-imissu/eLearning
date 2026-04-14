import * as userService from "./user.service.js";

export const listUsers = async (_req, res, next) => {
  try { res.json(await userService.listUsers()); } catch (e) { next(e); }
};

export const updateUserStatus = async (req, res, next) => {
  try { res.json(await userService.updateUserStatus({ id: req.params.id, status: req.body.status })); } catch (e) { next(e); }
};

export const assignRoles = async (req, res, next) => {
  try { res.json(await userService.assignRoles({ id: req.params.id, roleNames: req.body.roleNames })); } catch (e) { next(e); }
};
