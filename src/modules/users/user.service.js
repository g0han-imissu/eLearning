const { findUsers, updateStatusById, findRolesByNames, clearUserRoles, createUserRoles } = require("./user.repository");

const listUsers = () => findUsers();

const updateUserStatus = ({ id, status }) => updateStatusById(id, status);

const assignRoles = async ({ id, roleNames }) => {
  const roles = await findRolesByNames(roleNames);
  await clearUserRoles(id);
  await createUserRoles(roles.map((role) => ({ userId: id, roleId: role.id })));
  return { message: "Roles updated" };
};

module.exports = { listUsers, updateUserStatus, assignRoles };
