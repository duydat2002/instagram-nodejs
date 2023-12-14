const jwt = require("jsonwebtoken");

const generateToken = (data, secretToken, tokenLife) => {
  return jwt.sign({ data }, secretToken, { expiresIn: tokenLife });
};

const verifyToken = (token, secretToken) => {
  return jwt.verify(token, secretToken);
};

module.exports = {
  generateToken,
  verifyToken,
};
