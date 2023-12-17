const jwt = require("jsonwebtoken");

const verifyTokenWithPermission = (isCheckPermission = true) => {
  return (req, res, next) => {
    return verifyToken(req, res, () => {
      if (isCheckPermission && req.payload.id != req.params.id) {
        return res.status(403).json({
          success: false,
          result: null,
          message: "Permission denied.",
        });
      }

      next();
    });
  };
};

const verifyToken = (req, res, next) => {
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

    req.payload = decoded;
    next();
  });
};

module.exports = {
  verifyToken,
  verifyTokenWithPermission,
};
