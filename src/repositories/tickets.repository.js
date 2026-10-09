import ticketsDao from "../dao/tickets.dao.js";

export const ACTIVE_TICKET_STATUSES = ["confirmed", "pending"];

const activeFilter = { status: { $in: ACTIVE_TICKET_STATUSES } };

const createTicket = async (ticketData) => ticketsDao.create(ticketData);

const findTicketById = async (id) => ticketsDao.findById(id);

const hasActiveTicket = async (userId, eventId) =>
  ticketsDao.exists({ user: userId, event: eventId, ...activeFilter });

const countActiveTickets = async (eventId) =>
  ticketsDao.sumQuantity({ event: eventId, ...activeFilter });

const findTicketsByUser = async (userId) =>
  ticketsDao.find(
    { user: userId },
    { populate: [{ path: "event", select: "title date location" }] },
  );

const findTicketsByEvent = async (eventId) => ticketsDao.find({ event: eventId });

const cancelTicket = async (id, cancelledAt = new Date()) =>
  ticketsDao.updateOne(
    { _id: id, ...activeFilter },
    { $set: { status: "cancelled", cancelledAt } },
  );

export default {
  createTicket,
  findTicketById,
  hasActiveTicket,
  countActiveTickets,
  findTicketsByUser,
  findTicketsByEvent,
  cancelTicket,
};
