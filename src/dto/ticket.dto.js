import { isPopulated, toId } from "./dto.utils.js";
import { toEventSummaryDTO } from "./event.dto.js";

// Ticket visto por su dueño (o admin). Lista blanca de campos: aunque el
// ticket venga con user populado, sus datos (incluido password) nunca salen.
export const toTicketDTO = (ticket) => ({
  id: toId(ticket._id),
  event: isPopulated(ticket.event) ? toEventSummaryDTO(ticket.event) : toId(ticket.event),
  status: ticket.status,
  quantity: ticket.quantity,
  reservationCode: ticket.reservationCode,
  createdAt: ticket.createdAt,
  cancelledAt: ticket.cancelledAt,
});

// Ticket visto por el organizador del evento: sin datos personales del comprador.
export const toEventTicketDTO = (ticket) => ({
  id: toId(ticket._id),
  status: ticket.status,
  quantity: ticket.quantity,
  createdAt: ticket.createdAt,
  cancelledAt: ticket.cancelledAt,
});
