const User = require("@/models/user");
const Token = require("@/models/token");
const { singleUpload } = require("@/handlers/firebaseUpload");

const userController = {
  getAllUser: async (req, res) => {
    const users = await User.find({}, { password: 0 });
    return res.status(200).json({
      success: true,
      result: { users },
      message: "Get done.",
    });
  },
  getUserByUsername: async (req, res) => {
    const user = await User.findOne({ username: req.params.username }, { password: 0 });

    return res.status(200).json({
      success: true,
      result: { user },
      message: "Get done.",
    });
  },
  updateUser: async (req, res) => {
    if (req.file) {
      if (!req.file.mimetype.includes("image")) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Avatar must be image.",
          keyValue: "avatar",
        });
      }

      const avatar = await singleUpload(req.file, `${req.payload.id}/avatar`);

      req.body.avatar = avatar;
    }

    const user = await User.findOneAndUpdate({ username: req.params.username }, req.body, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      result: user,
      message: "Update done.",
    });
  },
  deleteUser: async (req, res) => {
    const user = await User.findOneAndDelete({ username: req.params.username });
    if (user) {
      await Token.findOneAndDelete({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      result: user,
      message: "Delete done.",
    });
  },
  followUser: async (req, res) => {
    const user = await User.findOne({ username: req.params.username }, {});
    const otherUser = await User.findOne({ username: req.body.username }, {});

    if (user && otherUser && !user.followings.includes(otherUser._id)) {
      user.followings.push(otherUser._id);
      otherUser.followers.push(user._id);

      await Promise.all[(user.save(), otherUser.save())];
    }

    return res.status(200).json({
      success: true,
      result: null,
      message: `${req.params.username} followed ${req.body.username}.`,
    });
  },
  unfollowUser: async (req, res) => {
    const user = await User.findOne({ username: req.params.username }, {});
    const otherUser = await User.findOne({ username: req.body.username }, {});

    const otherUserIndex = user.followings.findIndex((u) => u._id.equals(otherUser._id));
    const userIndex = otherUser.followers.findIndex((u) => u._id.equals(user._id));

    if (user && otherUser && otherUserIndex != -1 && userIndex != -1) {
      user.followings.splice(otherUserIndex, 1);
      otherUser.followers.splice(userIndex, 1);

      await Promise.all[(user.save(), otherUser.save())];
    }

    return res.status(200).json({
      success: true,
      result: null,
      message: `${req.params.username} unfollowed ${req.body.username}.`,
    });
  },
  uploadTest: async (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).send("Error: No files found");
    }
    if (!file.mimetype.includes("image")) {
      return res.status(400).send("File must be image");
    }

    const url = await singleUpload(file, "cac");

    return res.status(200).json({ cac: "cac", url });
  },
};

module.exports = userController;
