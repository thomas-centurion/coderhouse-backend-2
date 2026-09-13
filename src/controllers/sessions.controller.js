import sessionsService from "../services/sessions.service.js";

const getSessions = (req, res) => {
  res.status(200).json({
    status: "success",
    payload: [],
  });
};

const register = async (req, res) => {
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
    const status = error.status || 400;

    res.status(status).json({
      status: "error",
      message: error.message,
    });
  }
};

export default {
  getSessions,
  register,
};