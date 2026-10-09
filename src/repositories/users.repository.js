import usersDao from "../dao/users.dao.js";

const findByEmail = async (email) => usersDao.findOne({ email });

const findUserById = async (id) => usersDao.findById(id);

const findAllUsers = async () => usersDao.find({}, { projection: { password: 0 } });

const createUser = async (userData) => usersDao.create(userData);

export default {
  findByEmail,
  findUserById,
  findAllUsers,
  createUser,
};
