import { Router } from "express";
import sessionsController from "../controllers/sessions.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", sessionsController.getSessions);

router.post("/register", sessionsController.register);
router.post("/login", sessionsController.login);
router.get("/current", authMiddleware, sessionsController.current);
router.post("/logout", sessionsController.logout);

export default router;
