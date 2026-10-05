import sessionsService from "../services/sessions.service.js";
import env from "../config/env.js";

const getSessions = (req, res) => {
  res.status(200).json({
    status: "success",
    payload: [],
  });
};

const register = async (req, res, next) => {
  try {
    const user = await sessionsService.registerUser(req.body);

    const userResponse = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      status: "success",
      payload: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 3600000,
  secure: env.NODE_ENV === "production",
};

const login = async (req, res, next) => {
  try {
    const token = await sessionsService.loginUser(req.body);
    res.cookie("currentUser", token, cookieOptions);
    res.status(200).json({
      status: "success",
      message: "Login correcto",
    });
  } catch (error) {
    next(error);
  }
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
