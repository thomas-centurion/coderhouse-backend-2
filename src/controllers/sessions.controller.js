import env from "../config/env.js";
import sessionsService from "../services/sessions.service.js";
import { toCurrentUserDTO, toUserDTO } from "../dto/user.dto.js";

const getSessions = (req, res) => {
  res.status(200).json({
    status: "success",
    payload: [],
  });
};

const register = (req, res) => {
  res.status(201).json({
    status: "success",
    payload: toUserDTO(req.user),
  });
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 3600000,
  secure: env.NODE_ENV === "production",
};

const login = (req, res) => {
  const token = sessionsService.createSessionToken(req.user);

  res.cookie("currentUser", token, cookieOptions);
  res.status(200).json({
    status: "success",
    message: "Login correcto",
  });
};

const current = (req, res) => {
  res.status(200).json({
    status: "success",
    payload: toCurrentUserDTO(req.user),
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
