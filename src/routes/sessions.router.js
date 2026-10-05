import { Router } from "express";
import passport from "passport";
import sessionsController from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", sessionsController.getSessions);

router.post(
  "/register",
  passport.authenticate("register", { session: false }),
  sessionsController.register,
);
router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  sessionsController.login,
);
router.get(
  "/current",
  passport.authenticate("current", { session: false }),
  sessionsController.current,
);
router.post("/logout", sessionsController.logout);

export default router;
