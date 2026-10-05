import usersRepository from "../repositories/users.repository.js";

const getAllUsers = async () => {
  const users = await usersRepository.findAllUsers();

  return users.map(({ _id, first_name, last_name, email, role }) => ({
    id: _id.toString(),
    first_name,
    last_name,
    email,
    role,
  }));
};

export default {
  getAllUsers,
};
