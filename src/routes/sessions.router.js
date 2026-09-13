import { Router } from "express";
import sessionsController from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", sessionsController.getSessions);

export default router;