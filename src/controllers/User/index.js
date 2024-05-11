const User = require("@/models/user");
const Post = require("@/models/post");
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
  getUserPreview: async (req, res) => {
    const user = await User.findById(req.params.id, { password: 0 });
    const posts = await Post.find({ author: req.params.id }).sort({ createAt: -1 }).limit(3);

    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found user.",
      });

    return res.status(200).json({
      success: true,
      result: { user, posts },
      message: "Successfully get user review.",
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
  // 0. The users has followed you
  //     $in: [user._id, "$followings"]
  // 1. The users is followed by the person you are following
  //     $in: ["$followers", user.followings]
  // 2. The users who are following the person you are following
  //     $in: ["$followings", user.followings]
  // 3. The users who are followed by the person who is following you
  //     $in: ["$followers", user.followers]
  // 4. Orther users
  getFriendSuggestion: async (req, res) => {
    const user = await User.findById(req.payload.id);

    const users = await User.aggregate([
      {
        $match: {
          $and: [{ _id: { $ne: user._id } }, { followers: { $nin: [user._id] } }],
        },
      },
      {
        $addFields: {
          id: "$_id",
          order: {
            $cond: [
              { $in: [user._id, "$followings"] },
              0,
              {
                $cond: [
                  { $in: ["$followers", user.followings] },
                  1,
                  {
                    $cond: [
                      { $in: ["$followings", user.followings] },
                      2,
                      {
                        $cond: [{ $in: ["$followers", user.followers] }, 3, 4],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          id: 1,
          username: 1,
          fullname: 1,
          avatar: 1,
          followers: 1,
          followings: 1,
          isFollowed: 1,
          order: 1,
        },
      },
      {
        $sort: { order: 1 },
      },
      {
        $limit: 5,
      },
    ]);

    return res.status(200).json({
      success: true,
      result: { users },
      message: "Successfully get friend suggestion.",
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
