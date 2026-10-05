import Event from "../models/Event.js";

const findAll = async () => Event.find().lean();

const findById = async (id) => Event.findById(id);

const create = async (eventData) => Event.create(eventData);

const updateById = async (id, eventData) =>
  Event.findByIdAndUpdate(id, eventData, {
    new: true,
    runValidators: true,
  });

const deleteById = async (id) => Event.findByIdAndDelete(id);

export default {
  findAll,
  findById,
  create,
  updateById,
  deleteById,
};
