const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
  });
};

export default notFoundMiddleware;
