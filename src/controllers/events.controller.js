import eventsService from "../services/events.service.js";

const getEvents = async (req, res, next) => {
  try {
    const result = await eventsService.getEvents(req.query);
    res.status(200).json({ status: "success", payload: result });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventsService.getEventById(req.params.id);
    res.status(200).json({ status: "success", payload: event });
  } catch (error) { next(error); }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await eventsService.createEvent(req.body ?? {}, req.user);
    res.status(201).json({ status: "success", payload: event });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await eventsService.updateEvent(
      req.params.id,
      req.body ?? {},
      req.user,
    );
    res.status(200).json({ status: "success", payload: event });
  } catch (error) {
    next(error);
  }
};

const cancelEvent = async (req, res, next) => {
  try {
    await eventsService.cancelEvent(req.params.id, req.user);
    res.status(200).json({
      status: "success",
      message: "Evento cancelado",
    });
  } catch (error) {
    next(error);
  }
};

const updateEventStatus = async (req, res, next) => {
  try {
    const event = await eventsService.updateEventStatus(req.params.id, req.body?.status, req.user);
    res.status(200).json({ status: "success", payload: event });
  } catch (error) { next(error); }
};

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent,
  updateEventStatus,
};
