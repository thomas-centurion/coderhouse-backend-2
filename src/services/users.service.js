import usersRepository from "../repositories/users.repository.js";
import { toUserDTO } from "../dto/user.dto.js";

const getAllUsers = async () => {
  const users = await usersRepository.findAllUsers();
  return users.map(toUserDTO);
};

export default {
  getAllUsers,
};
