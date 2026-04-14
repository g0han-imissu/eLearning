import ApiError from "../utils/apiError.js";

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

export default errorMiddleware;
