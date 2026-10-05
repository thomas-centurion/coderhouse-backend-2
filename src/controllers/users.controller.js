import usersService from "../services/users.service.js";

const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers();

    res.status(200).json({
      status: "success",
      payload: users,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllUsers,
};
