import eventsDao from "../dao/events.dao.js";

const findAllEvents = async (options) => eventsDao.findAll(options);

const countEvents = async (filter) => eventsDao.count(filter);

const findEventById = async (id) => eventsDao.findById(id);

const createEvent = async (eventData) => eventsDao.create(eventData);

const updateEvent = async (id, eventData) =>
  eventsDao.updateById(id, eventData);

export default {
  findAllEvents,
  countEvents,
  findEventById,
  createEvent,
  updateEvent,
};
