const User = require("@/models/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userController = {
  getAllUser: async (req, res) => {
    try {
      const users = await User.find({});
      return res.status(200).json({
        success: true,
        result: { users },
        message: "Get done.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        result: null,
        message: `Failed`,
      });
    }
  },

  createUser: async (req, res) => {
    const passwordHash = await bcrypt.hash(
      req.body.password || "cac",
      saltRounds
    );

    return res.status(200).json({
      success: true,
      result: { passwordHash, cac: req.body.password || "lon" },
      message: "cac.",
    });
  },
};

module.exports = userController;
