import eventsService from "../services/events.service.js";

const getEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getEvents();
    res.status(200).json({ status: "success", payload: events });
  } catch (error) {
    next(error);
  }
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

export default {
  getEvents,
  createEvent,
  updateEvent,
  cancelEvent,
};
