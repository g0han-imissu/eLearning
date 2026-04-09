const ApiError = require("../utils/apiError");

const requireRoles = (...allowedRoles) => (req, _res, next) => {
  const userRoles = req.user?.roles || [];
  const ok = allowedRoles.some((role) => userRoles.includes(role));
  if (!ok) return next(new ApiError(403, "Permission denied"));
  return next();
};

module.exports = requireRoles;
