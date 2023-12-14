const jwt = require("jsonwebtoken");
const User = require("@/models/user");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Access token is required.",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        result: null,
        message: "Unauthorized.",
      });
    }

    req.userId = decoded.id;
    next();
  });
};

module.exports = {
  verifyToken,
};