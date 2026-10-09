import eventsDao from "../dao/events.dao.js";

const findEvents = async (filter, options) => eventsDao.find(filter, options);

const countEvents = async (filter) => eventsDao.count(filter);

const findEventById = async (id) => eventsDao.findById(id);

const createEvent = async (eventData) => eventsDao.create(eventData);

const updateEvent = async (id, eventData) => eventsDao.update(id, eventData);

const updateEventStatus = async (id, status) => eventsDao.update(id, { status });

export default {
  findEvents,
  countEvents,
  findEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
};
