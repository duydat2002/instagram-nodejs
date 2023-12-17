const User = require("@/models/user");
const Token = require("@/models/token");
const {
  singleUpload,
  multipleUpload,
  deleteFileStorageByUrl,
  deleteFolderStorage,
} = require("@/handlers/firebaseUpload");

const userController = {
  getAllUser: async (req, res) => {
    const users = await User.find({}, { password: 0 });
    return res.status(200).json({
      success: true,
      result: { users },
      message: "Get done.",
    });
  },
  getUserById: async (req, res) => {
    const user = await User.findById(req.params.id, { password: 0 });

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

      const avatar = await singleUpload(req.file, `${req.params.id}/avatar`);

      req.body.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      result: user,
      message: "Update done.",
    });
  },
  deleteUser: async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
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
    const user = await User.findById(req.params.id, { username: 1, followings: 1 });
    const otherUser = await User.findById(req.body.id, { username: 1, followers: 1 });

    if (!user || !otherUser) {
      return res.status(500).json({
        success: false,
        result: null,
        message: `User not found.`,
      });
    }

    if (!user.followings.includes(otherUser._id)) {
      user.followings.push(otherUser._id);
      otherUser.followers.push(user._id);

      await Promise.all[(user.save(), otherUser.save())];
    }

    return res.status(200).json({
      success: true,
      result: null,
      message: `${user.username} followed ${otherUser.username}.`,
    });
  },
  unfollowUser: async (req, res) => {
    const user = await User.findById(req.params.id, { username: 1, followings: 1 });
    const otherUser = await User.findById(req.body.id, { username: 1, followers: 1 });

    if (!user || !otherUser) {
      return res.status(500).json({
        success: false,
        result: null,
        message: `User not found.`,
      });
    }

    const otherUserIndex = user.followings.findIndex((u) => u._id.equals(otherUser._id));
    const userIndex = otherUser.followers.findIndex((u) => u._id.equals(user._id));

    if (otherUserIndex != -1 && userIndex != -1) {
      user.followings.splice(otherUserIndex, 1);
      otherUser.followers.splice(userIndex, 1);

      await Promise.all[(user.save(), otherUser.save())];
    }

    return res.status(200).json({
      success: true,
      result: null,
      message: `${user.username} unfollowed ${otherUser.username}.`,
    });
  },
  uploadTest: async (req, res) => {
    const files = req.files;

    if (!files) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "No files found.",
      });
    }

    files.forEach((file) => {
      if (!file.mimetype.includes("image")) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "File must be image.",
        });
      }
    });

    const urls = await multipleUpload(files, "testne");

    return res.status(200).json({ urls });

    // const file = req.file;
    // if (!file) {
    //   return res.status(400).send("Error: No files found");
    // }
    // if (!file.mimetype.includes("image")) {
    //   return res.status(400).send("File must be image");
    // }

    // const url = await multipleUpload(file, "cac");

    // return res.status(200).json({ url });
  },
};

module.exports = userController;
