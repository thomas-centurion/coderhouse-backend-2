import env from "../config/env.js";
import { generateToken } from "../utils/jwt.js";

const getSessions = (req, res) => {
  res.status(200).json({
    status: "success",
    payload: [],
  });
};

const register = (req, res) => {
  const { _id, first_name, last_name, email, role } = req.user;

  res.status(201).json({
    status: "success",
    payload: {
      id: _id,
      first_name,
      last_name,
      email,
      role,
    },
  });
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 3600000,
  secure: env.NODE_ENV === "production",
};

const login = (req, res) => {
  const token = generateToken({
    id: req.user._id.toString(),
    email: req.user.email,
    role: req.user.role,
  });

  res.cookie("currentUser", token, cookieOptions);
  res.status(200).json({
    status: "success",
    message: "Login correcto",
  });
};

const current = (req, res) => {
  const { id, email, role } = req.user;
  res.status(200).json({
    status: "success",
    payload: { id, email, role },
  });
};

const logout = (req, res) => {
  res.clearCookie("currentUser", {
    httpOnly: cookieOptions.httpOnly,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
  });
  res.status(200).json({
    status: "success",
    message: "Sesión cerrada",
  });
};

export default {
  getSessions,
  register,
  login,
  current,
  logout,
};
