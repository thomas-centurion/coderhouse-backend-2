import usersRepository from "../repositories/users.repository.js";
import { hashPassword } from "../utils/hash.js";

const registerUser = async ({
  first_name,
  last_name,
  email,
  password,
}) => {
  const validationError = (message) => {
    const error = new Error(message);
    error.status = 400;
    return error;
  };

  if (!first_name || !last_name || !email || !password) {
    throw validationError("Faltan campos obligatorios");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw validationError("El email no es válido");
  }

  if (password.length < 6) {
    throw validationError("La contraseña debe tener al menos 6 caracteres");
  }

  const existingUser = await usersRepository.findUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("El email ya está registrado");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const user = await usersRepository.createUser({
    first_name,
    last_name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  return user;
};

export default {
  registerUser,
};
