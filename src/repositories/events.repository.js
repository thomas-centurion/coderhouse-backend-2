import eventsDao from "../dao/events.dao.js";

const findAllEvents = async () => eventsDao.findAll();

const findEventById = async (id) => eventsDao.findById(id);

const createEvent = async (eventData) => eventsDao.create(eventData);

const updateEvent = async (id, eventData) =>
  eventsDao.updateById(id, eventData);

const deleteEvent = async (id) => eventsDao.deleteById(id);

export default {
  findAllEvents,
  findEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
