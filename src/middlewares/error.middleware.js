const ApiError = require("../utils/apiError");

const errorMiddleware = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({ message: "Validation failed", details: err.issues });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

module.exports = errorMiddleware;
