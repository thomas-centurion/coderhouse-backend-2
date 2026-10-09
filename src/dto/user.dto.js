import { toId } from "./dto.utils.js";

// Datos públicos de un usuario. Nunca incluye password.
export const toUserDTO = (user) => ({
  id: toId(user._id ?? user.id),
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role,
});

// Usuario autenticado en /api/sessions/current (payload del JWT).
export const toCurrentUserDTO = (user) => ({
  id: toId(user.id ?? user._id),
  email: user.email,
  role: user.role,
});

// Datos mínimos de un usuario relacionado (populate) dentro de otro recurso.
export const toUserSummaryDTO = (user) => ({
  id: toId(user._id ?? user.id),
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
});
