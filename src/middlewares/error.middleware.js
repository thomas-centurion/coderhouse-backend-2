// Traduce cualquier error a un formato único { status: "error", message }.
const resolveError = (error) => {
  if (error.status) return { status: error.status, message: error.message };

  if (error.name === "ValidationError" || error.name === "CastError") {
    return { status: 400, message: "Datos inválidos" };
  }

  if (error.code === 11000) {
    return { status: 409, message: "El recurso ya existe" };
  }

  return { status: 500 };
};

const errorMiddleware = (error, req, res, next) => {
  const { status, message } = resolveError(error);

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    status: "error",
    message: status >= 500
      ? "Error interno del servidor"
      : message || "Ocurrió un error",
  });
};

export default errorMiddleware;
