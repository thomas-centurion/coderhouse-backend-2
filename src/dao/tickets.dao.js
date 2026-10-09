import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";

const find = async (filter = {}, { sort = { createdAt: -1 }, populate = [] } = {}) =>
  Ticket.find(filter).sort(sort).populate(populate).lean();

const findOne = async (filter) => Ticket.findOne(filter);

const findById = async (id) => (mongoose.isValidObjectId(id) ? Ticket.findById(id) : null);

const exists = async (filter) => Ticket.exists(filter);

const create = async (ticketData) => Ticket.create(ticketData);

const updateOne = async (filter, ticketData) =>
  Ticket.findOneAndUpdate(filter, ticketData, { returnDocument: "after", runValidators: true });

const count = async (filter = {}) => Ticket.countDocuments(filter);

const sumQuantity = async (filter = {}) => {
  const [result] = await Ticket.aggregate([
    { $match: filter },
    { $group: { _id: null, quantity: { $sum: "$quantity" } } },
  ]);

  return result?.quantity ?? 0;
};

export default {
  find,
  findOne,
  findById,
  exists,
  create,
  updateOne,
  count,
  sumQuantity,
};
