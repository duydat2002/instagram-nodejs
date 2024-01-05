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
    const posts = await Post.find({ author: req.params.userId });

    return res.status(200).json({
      success: true,
      result: { posts },
      message: "Successfully get posts by author.",
    });
  },
  getSavedPostsByUserId: async (req, res) => {
    if (req.payload.id != req.params.userId)
      return res.status(403).json({
        success: false,
        result: null,
        message: "Permission denied.",
      });

    const user = await User.findById(req.params.userId, { saved_posts: 1 }).lean();
    const posts = await Post.find({ _id: { $in: user.saved_posts } });

    return res.status(200).json({
      success: true,
      result: { posts },
      message: "Successfully get saved posts.",
    });
  },
  getTaggedPostsByUserId: async (req, res) => {
    const posts = await Post.find({ tags: { $elemMatch: { $eq: req.params.userId } } });

    return res.status(200).json({
      success: true,
      result: { posts },
      message: "Successfully get tagged posts.",
    });
  },
};

module.exports = getPostsControllers;
