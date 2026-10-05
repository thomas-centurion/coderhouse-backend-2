import { Router } from "express";
import ticketsController from "../controllers/tickets.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/my-tickets", authMiddleware, ticketsController.getMyTickets);
router.patch("/:tid/cancel", authMiddleware, ticketsController.cancelTicket);

export default router;
