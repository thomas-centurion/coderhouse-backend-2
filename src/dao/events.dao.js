import mongoose from "mongoose";
import Event from "../models/Event.js";

const find = async (filter = {}, { skip = 0, limit = 10, sort = 1 } = {}) =>
  Event.find(filter).sort({ date: sort, _id: sort }).skip(skip).limit(limit).lean();

const findOne = async (filter) => Event.findOne(filter);

const findById = async (id) => (mongoose.isValidObjectId(id) ? Event.findById(id) : null);

const create = async (eventData) => Event.create(eventData);

const update = async (id, eventData) =>
  mongoose.isValidObjectId(id)
    ? Event.findByIdAndUpdate(id, eventData, { returnDocument: "after", runValidators: true })
    : null;

const count = async (filter = {}) => Event.countDocuments(filter);

export default {
  find,
  findOne,
  findById,
  create,
  update,
  count,
};
