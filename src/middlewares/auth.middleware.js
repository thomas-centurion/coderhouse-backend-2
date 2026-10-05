import passport from "passport";

const authMiddleware = passport.authenticate("current", { session: false });

export default authMiddleware;
