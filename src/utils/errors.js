export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export const badRequest = (message = "Datos inválidos") => new AppError(400, message);
export const unauthorized = (message = "No autenticado") => new AppError(401, message);
export const forbidden = (message = "No tenés permisos para realizar esta acción") =>
  new AppError(403, message);
export const notFound = (message = "Recurso no encontrado") => new AppError(404, message);
export const conflict = (message = "Conflicto con el estado actual del recurso") =>
  new AppError(409, message);
