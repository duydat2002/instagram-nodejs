const User = require("@/models/user");

const userFollowControllers = {
  followUser: async (req, res) => {
    const user = await User.findById(req.params.id, { username: 1, followings: 1 });
    const otherUser = await User.findById(req.body.id, { username: 1, followers: 1 });

    if (!user || !otherUser) {
      return res.status(500).json({
        success: false,
        result: null,
        message: `Cannot found user.`,
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
        message: `Cannot found user.`,
      });
    }

    const otherUserIndex = user.followings.findIndex((u) => u._id.equals(otherUser._id));
    const userIndex = otherUser.followers.findIndex((u) => u._id.equals(user._id));

    if (otherUserIndex != -1) user.followings.splice(otherUserIndex, 1);
    if (userIndex != -1) otherUser.followers.splice(userIndex, 1);

    await Promise.all[(user.save(), otherUser.save())];

    return res.status(200).json({
      success: true,
      result: null,
      message: `${user.username} unfollowed ${otherUser.username}.`,
    });
  },
  // Get mutual follow User by OtherUser
  getMutualFollowBy: async (req, res) => {
    const userId = req.params.id;
    const otherUserId = req.body.id;

    const mutual = await User.find(
      {
        followers: { $elemMatch: { $eq: otherUserId } },
        followings: { $elemMatch: { $eq: userId } },
      },
      { _id: 1, avatar: 1, username: 1, fullname: 1 }
    ).lean();

    return res.status(200).json({
      success: true,
      result: { mutual: mutual || [] },
      message: "Successfully get mutal.",
    });
  },
  getFollowers: async (req, res) => {
    const users = await User.find(
      { followings: { $elemMatch: { $eq: req.params.id } } },
      { _id: 1, avatar: 1, username: 1, fullname: 1 }
    ).lean();

    return res.status(200).json({
      success: true,
      result: { users: users || [] },
      message: "Successfully get followers.",
    });
  },
  getFollowings: async (req, res) => {
    const users = await User.find(
      { followers: { $elemMatch: { $eq: req.params.id } } },
      { _id: 1, avatar: 1, username: 1, fullname: 1 }
    ).lean();

    return res.status(200).json({
      success: true,
      result: { users: users || [] },
      message: "Successfully get followings.",
    });
  },
};

module.exports = userFollowControllers;
