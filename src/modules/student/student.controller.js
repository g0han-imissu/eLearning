const studentService = require("./student.service");

const me = async (req, res, next) => {
  try {
    const user = await studentService.me(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const myProgress = async (req, res, next) => {
  try {
    const result = await studentService.myProgress(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { me, myProgress };
