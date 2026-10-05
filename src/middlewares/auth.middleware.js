import { verifyToken } from "../utils/jwt.js";

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.currentUser;

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "No autenticado",
    });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({
      status: "error",
      message: "No autenticado",
    });
  }
};

export default authMiddleware;
