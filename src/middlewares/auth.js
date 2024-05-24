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
      return res.status(401).json({
        success: false,
        result: null,
        message: "Unauthorized.",
      });
    }

    req.payload = decoded;
    next();
  });
};

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth?.token ?? socket.handshake.headers?.token;

  if (!token) {
    return next(new Error("Access token is required."));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.request.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Unauthorized."));
  }
};

module.exports = {
  verifyToken,
  verifyTokenWithPermission,
  verifyTokenSocket,
};
