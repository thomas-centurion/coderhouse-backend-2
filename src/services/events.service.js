import eventsRepository from "../repositories/events.repository.js";
import { toEventDTO } from "../dto/event.dto.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";

const statuses = ["draft", "published", "cancelled", "finished"];
const fields = ["title", "description", "category", "date", "location", "capacity", "price"];

const permissionError = () => forbidden();
const notFoundError = () => notFound("Evento no encontrado");
const validationError = (message) => badRequest(message);

const parsePositiveInteger = (value, fallback, name) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw validationError(`${name} debe ser un entero positivo`);
  return parsed;
};

const getEvents = async (query = {}) => {
  const page = parsePositiveInteger(query.page, 1, "page");
  const limit = parsePositiveInteger(query.limit, 10, "limit");
  const sort = query.sort ?? "date";
  if (!["date", "-date"].includes(sort)) throw validationError("sort debe ser date o -date");

  const filter = {};
  for (const field of ["status", "category", "location"]) {
    if (query[field] !== undefined) {
      const value = String(query[field]).trim();
      if (!value) throw validationError(`${field} no puede estar vacío`);
      if (field === "status" && !statuses.includes(value)) throw validationError("Estado de evento inválido");
      const safeValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter[field] = field === "location" ? { $regex: safeValue, $options: "i" } : value;
    }
  }
  if (query.status === undefined) filter.status = "published";

  const dateRange = {};
  for (const [key, operator] of [["dateFrom", "$gte"], ["dateTo", "$lte"]]) {
    if (query[key] !== undefined) {
      const date = new Date(query[key]);
      if (Number.isNaN(date.getTime())) throw validationError(`${key} debe ser una fecha válida`);
      dateRange[operator] = date;
    }
  }
  if (dateRange.$gte && dateRange.$lte && dateRange.$gte > dateRange.$lte) {
    throw validationError("dateFrom no puede ser posterior a dateTo");
  }
  if (Object.keys(dateRange).length) filter.date = dateRange;

  const [events, total] = await Promise.all([
    eventsRepository.findEvents(filter, { skip: (page - 1) * limit, limit, sort: sort === "date" ? 1 : -1 }),
    eventsRepository.countEvents(filter),
  ]);
  return { data: events.map(toEventDTO), page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getEventById = async (id) => {
  const event = await eventsRepository.findEventById(id);
  if (!event) throw notFoundError();
  return toEventDTO(event);
};

const validateEventData = (data, { creating = false, existing = {} } = {}) => {
  const values = { ...(existing.toObject?.() ?? existing) };
  for (const field of fields) if (data[field] !== undefined) values[field] = data[field];
  if (creating && values.price === undefined) values.price = 0;

  for (const field of ["title", "description", "category", "location"]) {
    if (typeof values[field] !== "string" || !values[field].trim()) throw validationError(`${field} es obligatorio`);
    values[field] = values[field].trim();
  }
  const date = new Date(values.date);
  if (!values.date || Number.isNaN(date.getTime())) throw validationError("date debe ser una fecha válida");
  if (creating && date <= new Date()) throw validationError("La fecha del evento debe ser futura");
  if (!creating && data.date !== undefined && date <= new Date()) throw validationError("La fecha del evento debe ser futura");
  values.date = date;

  if (typeof values.capacity !== "number" || !Number.isFinite(values.capacity) || values.capacity <= 0) {
    throw validationError("capacity debe ser mayor que 0");
  }
  if (typeof values.price !== "number" || !Number.isFinite(values.price) || values.price < 0) {
    throw validationError("price debe ser mayor o igual que 0");
  }
  return Object.fromEntries(fields.map((field) => [field, values[field]]));
};

const createEvent = async (eventData, user) => {
  const data = validateEventData(eventData, { creating: true });
  const event = await eventsRepository.createEvent({ ...data, organizer: user.id });
  return toEventDTO(event);
};

const findEventForUpdate = async (id, user) => {
  const event = await eventsRepository.findEventById(id);
  if (!event) throw notFoundError();
  const isOwner = event.organizer?.toString() === user.id;
  if (user.role !== "admin" && !isOwner) throw permissionError();
  return event;
};

const updateEvent = async (id, changes, user) => {
  const existing = await findEventForUpdate(id, user);
  if (existing.status === "cancelled") throw validationError("No se puede modificar un evento cancelado");
  const eventData = validateEventData(changes, { existing });
  const event = await eventsRepository.updateEvent(id, eventData);
  return toEventDTO(event);
};

const updateEventStatus = async (id, status, user) => {
  const existing = await findEventForUpdate(id, user);
  if (existing.status === "cancelled") throw validationError("No se puede modificar un evento cancelado");
  if (!statuses.includes(status)) throw validationError("Estado de evento inválido");
  if (status === "published" && existing.status === "finished") throw validationError("No se puede publicar un evento finalizado");
  const event = await eventsRepository.updateEventStatus(id, status);
  return toEventDTO(event);
};

const cancelEvent = async (id, user) => updateEventStatus(id, "cancelled", user);

export default { getEvents, getEventById, createEvent, updateEvent, updateEventStatus, cancelEvent };
