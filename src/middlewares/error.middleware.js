const errorMiddleware = (error, req, res, next) => {
  const status = error.status || 500;
  const message = status >= 500
    ? "Error interno del servidor"
    : error.message || "Ocurrió un error";

  res.status(status).json({
    status: "error",
    message,
  });
};

export default errorMiddleware;
