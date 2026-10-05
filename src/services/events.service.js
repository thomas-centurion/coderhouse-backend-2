import mongoose from "mongoose";
import eventsRepository from "../repositories/events.repository.js";

const permissionError = () => {
  const error = new Error("No tenés permisos para realizar esta acción");
  error.status = 403;
  return error;
};

const notFoundError = () => {
  const error = new Error("Evento no encontrado");
  error.status = 404;
  return error;
};

const toPublicEvent = ({ _id, title, description, date }) => ({
  id: _id.toString(),
  title,
  description,
  date,
});

const getEvents = async () => {
  const events = await eventsRepository.findAllEvents();
  return events.map(toPublicEvent);
};

const createEvent = async (eventData, user) => {
  const event = await eventsRepository.createEvent({
    title: eventData.title,
    description: eventData.description,
    date: eventData.date,
    createdBy: user.id,
  });

  return toPublicEvent(event);
};

const findEventForUpdate = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw notFoundError();
  }

  const event = await eventsRepository.findEventById(id);

  if (!event) {
    throw notFoundError();
  }

  const isOwner = event.createdBy?.toString() === user.id;
  if (user.role !== "admin" && !isOwner) {
    throw permissionError();
  }

  return event;
};

const updateEvent = async (id, changes, user) => {
  await findEventForUpdate(id, user);

  const eventData = {};
  for (const field of ["title", "description", "date"]) {
    if (changes[field] !== undefined) {
      eventData[field] = changes[field];
    }
  }

  const event = await eventsRepository.updateEvent(id, eventData);
  return toPublicEvent(event);
};

const cancelEvent = async (id, user) => {
  await findEventForUpdate(id, user);
  await eventsRepository.deleteEvent(id);
};

export default {
  getEvents,
  createEvent,
  updateEvent,
  cancelEvent,
};
