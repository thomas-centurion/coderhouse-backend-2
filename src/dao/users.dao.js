import mongoose from "mongoose";
import User from "../models/User.js";

const find = async (filter = {}, { projection } = {}) => User.find(filter, projection).lean();

const findOne = async (filter) => User.findOne(filter);

const findById = async (id) => (mongoose.isValidObjectId(id) ? User.findById(id) : null);

const create = async (userData) => User.create(userData);

const update = async (id, userData) =>
  mongoose.isValidObjectId(id)
    ? User.findByIdAndUpdate(id, userData, { returnDocument: "after", runValidators: true })
    : null;

const count = async (filter = {}) => User.countDocuments(filter);

export default {
  find,
  findOne,
  findById,
  create,
  update,
  count,
};
