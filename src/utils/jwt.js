import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    noTimestamp: true,
  });
};

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);
