import passport from "passport";
import sessionsService from "../services/sessions.service.js";
import { verifyToken } from "../utils/jwt.js";
import { unauthorized } from "../utils/errors.js";

const createStrategy = (name, authenticate) => ({
  name,
  authenticate(req) {
    Promise.resolve()
      .then(() => authenticate(req))
      .then((user) => this.success(user))
      .catch((error) => this.error(error));
  },
});

const authenticationError = () => unauthorized();

passport.use(
  "register",
  createStrategy("register", (req) =>
    sessionsService.registerUser(req.body ?? {}),
  ),
);

passport.use(
  "login",
  createStrategy("login", (req) => sessionsService.loginUser(req.body)),
);

passport.use(
  "current",
  createStrategy("current", (req) => {
    const token = req.cookies?.currentUser;

    if (!token) {
      throw authenticationError();
    }

    try {
      return verifyToken(token);
    } catch {
      throw authenticationError();
    }
  }),
);
