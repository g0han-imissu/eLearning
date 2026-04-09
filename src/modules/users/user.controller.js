const userService = require("./user.service");

const listUsers = async (_req, res, next) => {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await userService.updateUserStatus({ id, status });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const assignRoles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleNames } = req.body;
    const result = await userService.assignRoles({ id, roleNames });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, updateUserStatus, assignRoles };
