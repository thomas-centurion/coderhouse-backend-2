import ticketsDao from "../dao/tickets.dao.js";

const createTicket = async (ticketData) => ticketsDao.create(ticketData);

const findActiveTicket = async (userId, eventId) =>
  ticketsDao.findActiveByUserAndEvent(userId, eventId);

const sumActiveQuantityForEvent = async (eventId) =>
  ticketsDao.sumActiveQuantityForEvent(eventId);

const findTicketsByUser = async (userId) => ticketsDao.findAllByUser(userId);

const findTicketsByEvent = async (eventId) => ticketsDao.findAllByEvent(eventId);

const findTicketById = async (id) => ticketsDao.findById(id);

const cancelActiveTicket = async (id, cancelledAt) =>
  ticketsDao.cancelActiveById(id, cancelledAt);

export default {
  createTicket,
  findActiveTicket,
  sumActiveQuantityForEvent,
  findTicketsByUser,
  findTicketsByEvent,
  findTicketById,
  cancelActiveTicket,
};
