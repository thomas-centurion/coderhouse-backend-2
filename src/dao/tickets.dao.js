import Ticket from "../models/Ticket.js";

const activeStatuses = ["confirmed", "pending"];

const create = async (ticketData) => Ticket.create(ticketData);

const findActiveByUserAndEvent = async (userId, eventId) =>
  Ticket.exists({
    user: userId,
    event: eventId,
    status: { $in: activeStatuses },
  });

const sumActiveQuantityForEvent = async (eventId) => {
  const [result] = await Ticket.aggregate([
    {
      $match: {
        event: eventId,
        status: { $in: activeStatuses },
      },
    },
    { $group: { _id: null, quantity: { $sum: "$quantity" } } },
  ]);

  return result?.quantity ?? 0;
};

const findAllByUser = async (userId) =>
  Ticket.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({ path: "event", select: "title date location" })
    .lean();

const findAllByEvent = async (eventId) =>
  Ticket.find({ event: eventId }).sort({ createdAt: -1 }).lean();

const findById = async (id) => Ticket.findById(id);

const cancelActiveById = async (id, cancelledAt) =>
  Ticket.findOneAndUpdate(
    { _id: id, status: { $in: activeStatuses } },
    { $set: { status: "cancelled", cancelledAt } },
    { new: true, runValidators: true },
  );

export default {
  create,
  findActiveByUserAndEvent,
  sumActiveQuantityForEvent,
  findAllByUser,
  findAllByEvent,
  findById,
  cancelActiveById,
};
