import usersDao from "../dao/users.dao.js";

const createUser = async (userData) => {
  return await usersDao.create(userData);
};

const findUserByEmail = async (email) => {
  return await usersDao.findByEmail(email);
};

export default {
  createUser,
  findUserByEmail,
};