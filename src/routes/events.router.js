import { Router } from "express";
import eventsController from "../controllers/events.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", eventsController.getEvents);
router.post(
  "/",
  authMiddleware,
  authorize("organizer", "admin"),
  eventsController.createEvent,
);
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
