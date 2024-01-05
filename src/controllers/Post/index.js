const Post = require("@/models/post");
const User = require("@/models/user");
const { checkFiles } = require("@/handlers/errorHandlers");
const { multipleUpload } = require("@/handlers/firebaseUpload");
const getPosts = require("./getPosts");

const checkUserPost = async (req) => {
  const userId = req.payload.id;

  const post = await Post.findById(req.params.postId);

  if (!post)
    return {
      success: false,
      user: null,
      post: null,
      message: "Cannot found post.",
    };

  const user = await User.findById(userId);

  if (!user)
    return {
      success: false,
      user: null,
      post: null,
      message: "Cannot found user.",
    };

  return {
    success: true,
    user,
    post,
  };
};

const postController = {
  getPostById: async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found post.",
      });

    return res.status(200).json({
      success: true,
      result: { post },
      message: "Successfully get post.",
    });
  },
  createPost: async (req, res) => {
    const { caption, tags, type, ratio } = req.body;
    const userId = req.payload.id;
    const files = req.files;

    const { success, message } = checkFiles(files, ["image", "video"]);
    if (!success) {
      return res.status(400).json({
        success: false,
        result: null,
        message: message,
      });
    }

    const post = await new Post({
      author: userId,
      caption,
      tags,
      type,
      ratio: ratio || 1,
    }).save();

    let urls = [];
    if (post.author) {
      urls = await multipleUpload(files, `${post.author._id}/posts/${post._id}`);
    }

    post.contents = urls;

    post.save();

    return res.status(200).json({
      success: true,
      result: post,
      message: "Successfully create post.",
    });
  },
  deletePost: async (req, res) => {
    const post = await Post.findById(req.params.postId, {});

    if (!post)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found post.",
      });

    if (post.author._id != req.payload.id)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Permission denied.",
      });

    await post.deleteOne();

    return res.status(200).json({
      success: true,
      result: post,
      message: "Successfully delete post.",
    });
  },
  updatePost: async (req, res) => {
    const { caption, tags } = req.body;

    const post = await Post.findById(req.params.postId);

    if (!post)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found post.",
      });

    if (post.author._id != req.payload.id)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Permission denied.",
      });

    post.caption = caption;
    post.tags = tags;

    post.save();

    return res.status(200).json({
      success: true,
      result: post,
      message: "Successfully update post.",
    });
  },
  likePost: async (req, res) => {
    const { success, user, post, message } = await checkUserPost(req);

    if (!success)
      return res.status(400).json({
        success: false,
        result: null,
        message,
      });

    if (!user.liked_posts.includes(post._id)) user.liked_posts.push(post._id);
    if (!post.likes.includes(user._id)) post.likes.push(user._id);

    await Promise.all([user.save(), post.save()]);

    return res.status(200).json({
      success: true,
      result: null,
      message: `${user.username} like post ${post._id}.`,
    });
  },
  unlikePost: async (req, res) => {
    const { success, user, post, message } = await checkUserPost(req);

    if (!success)
      return res.status(400).json({
        success: false,
        result: null,
        message,
      });

    const postIndex = user.liked_posts.findIndex((p) => p._id.equals(post._id));
    const userIndex = post.likes.findIndex((u) => u._id.equals(user._id));

    if (postIndex != -1) user.liked_posts.splice(postIndex, 1);
    if (userIndex != -1) post.likes.splice(userIndex, 1);

    await Promise.all([user.save(), post.save()]);

    return res.status(200).json({
      success: true,
      result: null,
      message: `${user.username} unlike post ${post._id}.`,
    });
  },
  savePost: async (req, res) => {
    const { success, user, post, message } = await checkUserPost(req);

    if (!success)
      return res.status(400).json({
        success: false,
        result: null,
        message,
      });

    if (!user.saved_posts.includes(post._id)) user.saved_posts.push(post._id);

    await user.save();

    return res.status(200).json({
      success: true,
      result: null,
      message: `${user.username} save post ${post._id}.`,
    });
  },
  unsavePost: async (req, res) => {
    const { success, user, post, message } = await checkUserPost(req);

    if (!success)
      return res.status(400).json({
        success: false,
        result: null,
        message,
      });

    const postIndex = user.saved_posts.findIndex((p) => p._id.equals(post._id));

    if (postIndex != -1) user.saved_posts.splice(postIndex, 1);

    await user.save();

    return res.status(200).json({
      success: true,
      result: null,
      message: `${user.username} unsave post ${post._id}.`,
    });
  },
  tagPost: async (req, res) => {
    const { success, user, post, message } = await checkUserPost(req);

    if (!success)
      return res.status(400).json({
        success: false,
        result: null,
        message,
      });

    if (!user._id.equals(post.author._id)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Permission denied.",
      });
    }

    const { tagUserId } = req.body;
    const tagUser = await User.findById(tagUserId);

    if (!tagUser)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found tag user.",
      });

    if (!post.tags.includes(tagUserId)) post.tags.push(tagUserId);
    if (!tagUser.tagged_posts.includes(post._id)) tagUser.tagged_posts.push(post._id);

    await Promise.all([tagUser.save(), post.save()]);

    return res.status(200).json({
      success: true,
      result: null,
      message: `${user.username} tag post ${post._id}.`,
    });
  },
  untagPost: async (req, res) => {
    const { success, user, post, message } = await checkUserPost(req);

    if (!success)
      return res.status(400).json({
        success: false,
        result: null,
        message,
      });

    if (!user._id.equals(post.author._id)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Permission denied.",
      });
    }

    const { tagUserId } = req.body;
    const tagUser = await User.findById(tagUserId);

    if (!tagUser)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found tag user.",
      });

    const postIndex = tagUser.tagged_posts.findIndex((p) => p._id.equals(post._id));
    const tagUserIndex = post.tags.findIndex((u) => u._id.equals(tagUser._id));

    if (postIndex != -1) tagUser.tagged_posts.splice(postIndex, 1);
    if (tagUserIndex != -1) post.tags.splice(tagUserIndex, 1);

    await Promise.all([tagUser.save(), post.save()]);

    return res.status(200).json({
      success: true,
      result: null,
      message: `${user.username} untag post ${post._id}.`,
    });
  },
  ...getPosts,
};

module.exports = postController;
