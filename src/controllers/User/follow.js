const User = require("@/models/user");
const Noti = require("@/models/notification");
const { Types } = require("mongoose");

const projectFollowUser = {
  id: 1,
  username: 1,
  fullname: 1,
  avatar: 1,
  followers: 1,
  followings: 1,
  isFollowed: 1,
  followOrder: 1,
};

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

      // Notification
      const noti = new Noti({
        sender: user._id,
        recipient: otherUser._id,
        type: "follow",
        content: `${user.username} is following you now.`,
      });

      await Promise.all[(user.save(), otherUser.save(), noti.save())];
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
  // followOrder isUser - 0, followed - 1, no follow - 2
  getFollowers: async (req, res) => {
    const userId = new Types.ObjectId(req.payload.id);
    const profileUserId = new Types.ObjectId(req.params.id);

    const users = await User.aggregate([
      { $match: { followings: { $elemMatch: { $eq: profileUserId } } } },
      {
        $addFields: {
          id: "$_id",
          isFollowed: {
            $cond: [{ $in: [userId, "$followers"] }, true, false],
          },
          followOrder: {
            $cond: [
              { $eq: [userId, "$_id"] },
              0,
              {
                $cond: [{ $in: [userId, "$followers"] }, 1, 2],
              },
            ],
          },
        },
      },
      {
        $project: projectFollowUser,
      },
      {
        $sort: { followOrder: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      result: { users: users || [] },
      message: "Successfully get followers.",
    });
  },
  // Get mutual follow ProfileUser by User
  getMutualFollowBy: async (req, res) => {
    const userId = new Types.ObjectId(req.payload.id);
    const profileUserId = new Types.ObjectId(req.params.id);

    const users = await User.aggregate([
      {
        $match: {
          followers: { $elemMatch: { $eq: userId } },
          followings: { $elemMatch: { $eq: profileUserId } },
        },
      },
      {
        $addFields: {
          id: "$_id",
          isFollowed: true,
          followOrder: 1,
        },
      },
      {
        $project: projectFollowUser,
      },
    ]);

    return res.status(200).json({
      success: true,
      result: { users: users || [] },
      message: "Successfully get mutal follow ProfileUser by User.",
    });
  },
  getFollowings: async (req, res) => {
    const userId = new Types.ObjectId(req.params.id);

    const users = await User.aggregate([
      { $match: { followers: { $elemMatch: { $eq: userId } } } },
      {
        $addFields: {
          id: "$_id",
          isFollowed: {
            $cond: [{ $in: [userId, "$followers"] }, true, false],
          },
          followOrder: {
            $cond: [
              { $eq: [userId, "$_id"] },
              0,
              {
                $cond: [{ $in: [userId, "$followers"] }, 1, 2],
              },
            ],
          },
        },
      },
      {
        $project: projectFollowUser,
      },
      {
        $sort: { followOrder: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      result: { users: users || [] },
      message: "Successfully get followings.",
    });
  },
  // Check user following other user
  checkIsFollowing: async (req, res) => {
    const otherUserId = new Types.ObjectId(req.params.id);
    const userId = new Types.ObjectId(req.payload.id);

    const result = await User.findOne({
      $and: [{ _id: otherUserId }, { followers: { $elemMatch: { $eq: userId } } }],
    });

    return res.status(200).json({
      success: true,
      result: !!result,
      message: `Successfully check.`,
    });
  },
};

module.exports = userFollowControllers;
