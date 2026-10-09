import { forbidden, unauthorized } from "../utils/errors.js";

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(unauthorized());
  if (!allowedRoles.includes(req.user.role)) return next(forbidden());
  next();
};

export default authorize;
