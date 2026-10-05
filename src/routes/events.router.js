import { Router } from "express";
import eventsController from "../controllers/events.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import ticketsController from "../controllers/tickets.controller.js";

const router = Router();

router.get("/", eventsController.getEvents);
router.get("/:id", eventsController.getEventById);
router.post("/:eid/tickets", authMiddleware, ticketsController.createTicket);
router.get("/:eid/tickets", authMiddleware, ticketsController.getEventTickets);
router.post(
  "/",
  authMiddleware,
  authorize("organizer", "admin"),
  eventsController.createEvent,
);
router.patch(
  "/:id/status",
  authMiddleware,
  authorize("organizer", "admin"),
  eventsController.updateEventStatus,
);
router.put(
  "/:id",
  authMiddleware,
  authorize("organizer", "admin"),
  eventsController.updateEvent,
);
// Compatibilidad con la ruta PATCH existente en P5.
router.patch(
  "/:id",
  authMiddleware,
  authorize("organizer", "admin"),
  eventsController.updateEvent,
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("organizer", "admin"),
  eventsController.cancelEvent,
);

export default router;
