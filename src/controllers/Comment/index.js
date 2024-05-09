const User = require("@/models/user");
const Post = require("@/models/post");
const Comment = require("@/models/comment");
const Reply = require("@/models/reply");

const commentController = {
  getAllComment: async (req, res) => {
    const comments = await Comment.find({});

    return res.status(200).json({
      success: true,
      result: { comments },
      message: "Successfully get comments.",
    });
  },
  getPostComments: async (req, res) => {
    const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: { comments },
      message: "Successfully get post comments.",
    });
  },
  getReplies: async (req, res) => {
    const replies = await Reply.find({ comment: req.params.commentId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: { replies },
      message: "Successfully get replies.",
    });
  },
  getLikedUsersOfComment: async (req, res) => {
    const userId = req.payload.id;

    let comment = await Comment.findById(req.params.commentId);
    if (!comment) comment = await Reply.findById(req.params.commentId);

    if (!comment)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found comment/ reply.",
      });

    const users = await User.aggregate([
      { $match: { _id: { $in: comment.likes } } },
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
        $project: {
          id: 1,
          username: 1,
          fullname: 1,
          avatar: 1,
          followers: 1,
          followings: 1,
          isFollowed: 1,
          followOrder: 1,
        },
      },
      {
        $sort: { followOrder: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      result: { users: users || [] },
      message: "Successfully get users liked comment/ reply.",
    });
  },
  updateComment: async (req, res) => {
    const { content } = req.body;
    const userId = req.payload.id;
    const comment = await Comment.findById(req.params.commentId, { author: 1 });
    const reply = await Reply.findById(req.params.commentId, { author: 1 });

    if (!comment || !reply)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found comment.",
      });

    if ((comment && comment.author._id != userId) || (reply && reply.author._id != userId))
      return res.status(400).json({
        success: false,
        result: null,
        message: "Permission denied.",
      });

    if (comment) {
      comment.content = content;
      await comment.save();
    }
    if (reply) {
      reply.content = content;
      await reply.save();
    }

    return res.status(200).json({
      success: true,
      result: { comment: comment || reply },
      message: "Successfully update comment.",
    });
  },
  deleteComment: async (req, res) => {
    const userId = req.payload.id;
    const comment = await Comment.findById(req.params.commentId, { author: 1 });
    const reply = await Reply.findById(req.params.commentId, { author: 1 });

    if (!comment && !reply)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found comment.",
      });

    if ((comment && comment.author._id != userId) || (reply && reply.author._id != userId))
      return res.status(400).json({
        success: false,
        result: null,
        message: "Permission denied.",
      });

    if (comment) await comment.deleteOne();
    if (reply) await reply.deleteOne();

    return res.status(200).json({
      success: true,
      result: null,
      message: "Successfully delete comment.",
    });
  },
  commentPost: async (req, res) => {
    const { content } = req.body;
    const userId = req.payload.id;

    const post = await Post.findById(req.params.postId, {});

    if (!post)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found post.",
      });

    const comment = await new Comment({
      author: userId,
      content,
      commentTo: "post",
      post: post._id,
    }).save();

    post.comments.push(comment._id);
    await post.save();

    return res.status(200).json({
      success: true,
      result: { comment },
      message: "Successfully comment post.",
    });
  },
  replyComment: async (req, res) => {
    const { content } = req.body;
    const userId = req.payload.id;

    const comment = await Comment.findById(req.params.commentId, { replies: 1 });

    if (!comment)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found comment.",
      });

    const reply = await new Reply({
      author: userId,
      content,
      comment: comment._id,
    }).save();

    comment.replies.push(reply._id);
    await comment.save();

    return res.status(200).json({
      success: true,
      result: { reply },
      message: "Successfully reply comment.",
    });
  },
  likeComment: async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.payload.id;

    let result = await Comment.findByIdAndUpdate(commentId, {
      $addToSet: { likes: userId },
    });

    if (!result)
      result = await Reply.findByIdAndUpdate(commentId, {
        $addToSet: { likes: userId },
      });

    if (!result)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found comment/ reply.",
      });

    return res.status(200).json({
      success: true,
      result: null,
      message: "Successfully like comment/ reply.",
    });
  },
  unlikeComment: async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.payload.id;

    let result = await Comment.findByIdAndUpdate(commentId, {
      $pull: { likes: userId },
    });

    if (!result)
      result = await Reply.findByIdAndUpdate(commentId, {
        $pull: { likes: userId },
      });

    if (!result)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found comment/ reply.",
      });

    return res.status(200).json({
      success: true,
      result: null,
      message: "Successfully like comment/ reply.",
    });
  },
};

module.exports = commentController;
