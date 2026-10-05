import mongoose from "mongoose";
import eventsRepository from "../repositories/events.repository.js";
import ticketsRepository from "../repositories/tickets.repository.js";
import emailService from "./email.service.js";

const activeStatuses = ["confirmed", "pending"];
const httpError = (status, message) => Object.assign(new Error(message), { status });
const notFoundError = (message) => httpError(404, message);
const validationError = (message) => httpError(400, message);
const conflictError = (message) => httpError(409, message);
const permissionError = () => httpError(403, "No tenés permisos para realizar esta acción");

const toOwnerTicket = (ticket, event = undefined) => ({
  id: ticket._id.toString(),
  event: event ?? ticket.event?.toString?.() ?? ticket.event,
  status: ticket.status,
  quantity: ticket.quantity,
  reservationCode: ticket.reservationCode,
  createdAt: ticket.createdAt,
  cancelledAt: ticket.cancelledAt,
});

const toEventTicket = (ticket) => ({
  id: ticket._id.toString(),
  status: ticket.status,
  quantity: ticket.quantity,
  createdAt: ticket.createdAt,
  cancelledAt: ticket.cancelledAt,
});

const getEvent = async (eventId) => {
  if (!mongoose.isValidObjectId(eventId)) throw notFoundError("Evento no encontrado");
  const event = await eventsRepository.findEventById(eventId);
  if (!event) throw notFoundError("Evento no encontrado");
  return event;
};

const createTicket = async (eventId, body, user) => {
  const event = await getEvent(eventId);
  if (event.status !== "published") {
    throw conflictError("Solo se permiten inscripciones a eventos publicados");
  }

  const { quantity } = body;
  if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
    throw validationError("quantity debe ser un número finito mayor que 0");
  }

  const duplicate = await ticketsRepository.findActiveTicket(user.id, event._id);
  if (duplicate) throw conflictError("Ya tenés una inscripción activa para este evento");

  const occupied = await ticketsRepository.sumActiveQuantityForEvent(event._id);
  if (occupied + quantity > event.capacity) {
    throw conflictError("No hay cupos suficientes para esa cantidad");
  }

  let ticket;
  try {
    ticket = await ticketsRepository.createTicket({
      user: user.id,
      event: event._id,
      quantity,
      status: "confirmed",
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.user && error.keyPattern?.event) {
      throw conflictError("Ya tenés una inscripción activa para este evento");
    }
    throw error;
  }

  try {
    await emailService.sendTicketConfirmation({
      to: user.email,
      eventTitle: event.title,
      date: event.date,
      location: event.location,
      quantity: ticket.quantity,
      reservationCode: ticket.reservationCode,
    });
  } catch {
    console.error("No se pudo enviar el email de confirmación de ticket");
  }

  return toOwnerTicket(ticket);
};

const getMyTickets = async (user) => {
  const tickets = await ticketsRepository.findTicketsByUser(user.id);
  return tickets.map((ticket) => {
    const event = ticket.event
      ? {
          title: ticket.event.title,
          date: ticket.event.date,
          location: ticket.event.location,
        }
      : null;
    return toOwnerTicket(ticket, event);
  });
};

const getEventTickets = async (eventId, user) => {
  const event = await getEvent(eventId);
  const isOwner = event.organizer?.toString() === user.id;
  const canListTickets = user.role === "admin" || (user.role === "organizer" && isOwner);
  if (!canListTickets) throw permissionError();

  const tickets = await ticketsRepository.findTicketsByEvent(event._id);
  return tickets.map(toEventTicket);
};

const cancelTicket = async (ticketId, user) => {
  if (!mongoose.isValidObjectId(ticketId)) throw notFoundError("Ticket no encontrado");
  const ticket = await ticketsRepository.findTicketById(ticketId);
  if (!ticket) throw notFoundError("Ticket no encontrado");

  const isOwner = ticket.user.toString() === user.id;
  if (user.role !== "admin" && !isOwner) throw permissionError();
  if (!activeStatuses.includes(ticket.status)) {
    throw conflictError("El ticket ya está cancelado");
  }

  const cancelled = await ticketsRepository.cancelActiveTicket(ticketId, new Date());
  if (!cancelled) throw conflictError("El ticket ya está cancelado");
  return toOwnerTicket(cancelled);
};

export default {
  createTicket,
  getMyTickets,
  getEventTickets,
  cancelTicket,
};
