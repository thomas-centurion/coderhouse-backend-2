import eventsRepository from "../repositories/events.repository.js";
import ticketsRepository, { ACTIVE_TICKET_STATUSES } from "../repositories/tickets.repository.js";
import { toEventTicketDTO, toTicketDTO } from "../dto/ticket.dto.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/errors.js";
import emailService from "./email.service.js";

const getEvent = async (eventId) => {
  const event = await eventsRepository.findEventById(eventId);
  if (!event) throw notFound("Evento no encontrado");
  return event;
};

const createTicket = async (eventId, body, user) => {
  const event = await getEvent(eventId);
  if (event.status !== "published") {
    throw conflict("Solo se permiten inscripciones a eventos publicados");
  }

  const { quantity } = body;
  if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
    throw badRequest("quantity debe ser un número finito mayor que 0");
  }

  const duplicate = await ticketsRepository.hasActiveTicket(user.id, event._id);
  if (duplicate) throw conflict("Ya tenés una inscripción activa para este evento");

  const occupied = await ticketsRepository.countActiveTickets(event._id);
  if (occupied + quantity > event.capacity) {
    throw conflict("No hay cupos suficientes para esa cantidad");
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
      throw conflict("Ya tenés una inscripción activa para este evento");
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

  return toTicketDTO(ticket);
};

const getMyTickets = async (user) => {
  const tickets = await ticketsRepository.findTicketsByUser(user.id);
  return tickets.map(toTicketDTO);
};

const getEventTickets = async (eventId, user) => {
  const event = await getEvent(eventId);
  const isOwner = event.organizer?.toString() === user.id;
  const canListTickets = user.role === "admin" || (user.role === "organizer" && isOwner);
  if (!canListTickets) throw forbidden();

  const tickets = await ticketsRepository.findTicketsByEvent(event._id);
  return tickets.map(toEventTicketDTO);
};

const cancelTicket = async (ticketId, user) => {
  const ticket = await ticketsRepository.findTicketById(ticketId);
  if (!ticket) throw notFound("Ticket no encontrado");

  const isOwner = ticket.user.toString() === user.id;
  if (user.role !== "admin" && !isOwner) throw forbidden();
  if (!ACTIVE_TICKET_STATUSES.includes(ticket.status)) {
    throw conflict("El ticket ya está cancelado");
  }

  const cancelled = await ticketsRepository.cancelTicket(ticket._id, new Date());
  if (!cancelled) throw conflict("El ticket ya está cancelado");
  return toTicketDTO(cancelled);
};

export default {
  createTicket,
  getMyTickets,
  getEventTickets,
  cancelTicket,
};
