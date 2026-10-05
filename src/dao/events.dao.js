import Event from "../models/Event.js";

const findAll = async ({ filter = {}, skip = 0, limit = 10, sort = 1 } = {}) =>
  Event.find(filter).sort({ date: sort, _id: sort }).skip(skip).limit(limit).lean();

const count = async (filter = {}) => Event.countDocuments(filter);

const findById = async (id) => Event.findById(id);

const create = async (eventData) => Event.create(eventData);

const updateById = async (id, eventData) =>
  Event.findByIdAndUpdate(id, eventData, {
    new: true,
    runValidators: true,
  });

export default {
  findAll,
  count,
  findById,
  create,
  updateById,
};
