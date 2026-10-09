import usersRepository from "../repositories/users.repository.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { badRequest, conflict, unauthorized } from "../utils/errors.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerUser = async ({
  first_name,
  last_name,
  email,
  password,
}) => {
  if (!first_name || !last_name || !email || !password) {
    throw badRequest("Faltan campos obligatorios");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailRegex.test(normalizedEmail)) {
    throw badRequest("El email no es válido");
  }

  if (password.length < 6) {
    throw badRequest("La contraseña debe tener al menos 6 caracteres");
  }

  const existingUser = await usersRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw conflict("El email ya está registrado");
  }

  const hashedPassword = await hashPassword(password);

  return usersRepository.createUser({
    first_name,
    last_name,
    email: normalizedEmail,
    password: hashedPassword,
  });
};

const loginUser = async ({ email, password } = {}) => {
  if (!email || !password) {
    throw badRequest("Email y contraseña son obligatorios");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await usersRepository.findByEmail(normalizedEmail);

  if (!user || !(await comparePassword(password, user.password))) {
    throw unauthorized("Credenciales inválidas");
  }

  return user;
};

const createSessionToken = (user) =>
  generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

export default {
  registerUser,
  loginUser,
  createSessionToken,
};
