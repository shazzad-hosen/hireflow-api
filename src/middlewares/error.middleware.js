const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "You already have an active application for this job.",
    });
  }
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

export default errorHandler;
