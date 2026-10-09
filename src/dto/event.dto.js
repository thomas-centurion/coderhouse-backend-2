import { isPopulated, toId } from "./dto.utils.js";
import { toUserSummaryDTO } from "./user.dto.js";

export const toEventDTO = (event) => ({
  id: toId(event._id),
  title: event.title,
  description: event.description,
  category: event.category,
  date: event.date,
  location: event.location,
  capacity: event.capacity,
  price: event.price,
  status: event.status,
  organizer: isPopulated(event.organizer)
    ? toUserSummaryDTO(event.organizer)
    : toId(event.organizer),
});

// Resumen del evento cuando se popula dentro de un ticket.
export const toEventSummaryDTO = (event) => ({
  title: event.title,
  date: event.date,
  location: event.location,
});
