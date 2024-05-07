const User = require("@/models/user");
const Token = require("@/models/token");
const userFollowControllers = require("./follow");
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
  getUser: async (req, res) => {
    const user = await User.findById(req.payload.id, { password: 0 });

    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found user.",
      });

    return res.status(200).json({
      success: true,
      result: { user },
      message: "Successfully get user.",
    });
  },
  getUserById: async (req, res) => {
    const user = await User.findById(req.params.id, { password: 0 });

    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found user.",
      });

    return res.status(200).json({
      success: true,
      result: { user },
      message: "Successfully get user.",
    });
  },
  getUserByUsername: async (req, res) => {
    const user = await User.findOne({ username: req.params.username }, { password: 0 });

    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found user.",
      });

    return res.status(200).json({
      success: true,
      result: { user },
      message: "Successfully get user.",
    });
  },
  updateUser: async (req, res) => {
    const { username, email, fullname, bio } = req.body;
    let avatarUrl;

    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found user.",
      });

    if (req.file) {
      if (!req.file.mimetype.includes("image")) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Avatar must be image.",
          keyValue: "avatar",
        });
      }

      avatarUrl = await singleUpload(req.file, `${req.params.id}/avatar`);

      if (user.avatar != process.env.DEFAUL_AVATAR_URL) deleteFileStorageByUrl(user.avatar);
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (fullname) user.fullname = fullname;
    if (bio) user.bio = bio;
    if (avatarUrl) user.avatar = avatarUrl;

    await user.save();

    return res.status(200).json({
      success: true,
      result: { user },
      message: "Successfully update user.",
    });
  },
  deleteUser: async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id, { password: 0 });

    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found user.",
      });

    await Token.findOneAndDelete({ user: user._id });

    return res.status(200).json({
      success: true,
      result: user,
      message: "Successfully delete user.",
    });
  },
  updateUserAvatar: async (req, res) => {
    const user = await User.findById(req.params.id, { password: 0 });
    let avatarUrl;

    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found user.",
      });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Avatar is required.",
        keyValue: "avatar",
      });
    }

    if (!req.file.mimetype.includes("image")) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Avatar must be image.",
        keyValue: "avatar",
      });
    }

    avatarUrl = await singleUpload(req.file, `${req.params.id}/avatar`);
    if (user.avatar != process.env.DEFAUL_AVATAR_URL) deleteFileStorageByUrl(user.avatar);

    if (avatarUrl) user.avatar = avatarUrl;

    await user.save();

    return res.status(200).json({
      success: true,
      result: { avatar: avatarUrl },
      message: "Successfully update user avatar.",
    });
  },
  deleteUserAvatar: async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: process.env.DEFAUL_AVATAR_URL },
      { new: true }
    ).select({ password: 0 });

    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found user.",
      });

    deleteFolderStorage(`${user._id}/avatar`);

    return res.status(200).json({
      success: true,
      result: null,
      message: "Successfully update user avatar.",
    });
  },
  ...userFollowControllers,
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
      console.log(file.mimetype);
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
