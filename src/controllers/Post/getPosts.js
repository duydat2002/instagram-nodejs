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
};

module.exports = getPostsControllers;
