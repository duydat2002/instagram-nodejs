const Post = require("@/models/post");
const User = require("@/models/user");

const getPostsControllers = {
  getAllPost: async (req, res) => {
    const posts = await Post.find({});

    return res.status(200).json({
      success: true,
      result: { posts },
      message: "Successfully get posts.",
    });
  },
  getPostsByAuthor: async (req, res) => {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: { posts },
      message: "Successfully get posts by author.",
    });
  },
  getSavedPosts: async (req, res) => {
    const user = await User.findById(req.payload.id, { saved_posts: 1 });
    const posts = await Post.find({ _id: { $in: user.saved_posts } }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: { posts },
      message: "Successfully get saved posts.",
    });
  },
  getTaggedPostsByUserId: async (req, res) => {
    const posts = await Post.find({ tags: { $elemMatch: { $eq: req.params.userId } } }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: { posts },
      message: "Successfully get tagged posts.",
    });
  },
  getOtherPostsByAuthor: async (req, res) => {
    const posts = await Post.find({ author: req.params.userId, _id: { $ne: req.params.postId } }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      result: { posts },
      message: "Successfully get other posts by author.",
    });
  },
  getPostsIsFollow: async (req, res) => {
    const user = await User.findById(req.payload.id);

    let posts = await Post.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [{ author: { $in: user.followers } }, { author: { $in: user.followings } }],
            },
            { author: { $ne: user.id } },
          ],
        },
      },
      {
        $addFields: {
          id: "$_id",
          isFollowed: {
            $cond: [{ $in: ["$author", user.followings] }, true, false],
          },
          followOrder: {
            $cond: [
              { $in: ["$author", user.followings] },
              0,
              {
                $cond: [{ $in: ["$author", user.followers] }, 1, 2],
              },
            ],
          },
        },
      },
      {
        $sort: { followOrder: 1, createdAt: -1 },
      },
    ]);

    posts = await Post.populate(posts, { path: "author", select: "_id username avatar" });

    return res.status(200).json({
      success: true,
      result: { posts },
      message: "Successfully get posts follow.",
    });
  },
};

module.exports = getPostsControllers;
