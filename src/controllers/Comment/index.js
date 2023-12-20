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
  getCommentById: async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found comment.",
      });

    return res.status(200).json({
      success: true,
      result: { comment },
      message: "Successfully get comment.",
    });
  },
  getReplies: async (req, res) => {
    const replies = await Comment.find({ parentComment: req.params.commentId });

    if (!replies)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found replies.",
      });

    return res.status(200).json({
      success: true,
      result: { replies },
      message: "Successfully get replies.",
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
      result: comment,
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
      result: comment || reply,
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
      result: comment,
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
      result: reply,
      message: "Successfully reply comment.",
    });
  },
};

module.exports = commentController;
