import { findUsers, updateStatusById, findRolesByNames, replaceUserRoles } from "./user.repository.js";

export const listUsers = () => findUsers();

export const updateUserStatus = ({ id, status }) => updateStatusById(id, status);

export const assignRoles = async ({ id, roleNames }) => {
  const roles = await findRolesByNames(roleNames);
  await replaceUserRoles(id, roles.map((role) => ({ userId: id, roleId: role.id })));
  return { message: "Roles updated" };
};
