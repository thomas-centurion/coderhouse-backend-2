import usersRepository from "../repositories/users.repository.js";
import { hashPassword } from "../utils/hash.js";

const registerUser = async ({
  first_name,
  last_name,
  email,
  password,
}) => {
  if (!first_name || !last_name || !email || !password) {
    throw new Error("Faltan campos obligatorios");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("El email no es válido");
  }

  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
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