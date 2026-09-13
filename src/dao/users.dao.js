import User from "../models/User.js";

const create = async (userData) => {
  return await User.create(userData);
};

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

export default {
  create,
  findByEmail,
};