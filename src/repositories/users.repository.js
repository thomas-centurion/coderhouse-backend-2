import usersDao from "../dao/users.dao.js";

const createUser = async (userData) => {
  return await usersDao.create(userData);
};

const findUserByEmail = async (email) => {
  return await usersDao.findByEmail(email);
};

const findAllUsers = async () => {
  return await usersDao.findAll();
};

export default {
  createUser,
  findUserByEmail,
  findAllUsers,
};
