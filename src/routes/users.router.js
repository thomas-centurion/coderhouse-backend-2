import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import usersController from "../controllers/users.controller.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorize("admin"),
  usersController.getAllUsers,
);

export default router;
