const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing/invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
