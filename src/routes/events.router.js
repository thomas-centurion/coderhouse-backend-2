import { Router } from "express";
import eventsController from "../controllers/events.controller.js";

const router = Router();

router.get("/", eventsController.getEvents);

export default router;