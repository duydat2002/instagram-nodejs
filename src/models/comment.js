const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema, Types } = mongoose;

const CommentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
      autopopulate: {
        select: "_id username avatar",
        maxDepth: 1,
      },
    },
    content: {
      type: String,
      require: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reply",
      },
    ],
    commentTo: {
      type: String,
      enum: {
        values: ["post", "story"],
        message: "Comment type must be in ['post', 'story']",
      },
      default: "post",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

CommentSchema.pre(["deleteOne", "findOneAndDelete", "deleteMany"], async function (next) {
  const Post = mongoose.model("Post");
  const Comment = mongoose.model("Comment");
  const Reply = mongoose.model("Reply");

  const deletedComments = await Comment.find(this.getFilter(), { _id: 1 }).lean();
  const deletedCommentsId = deletedComments.map((comment) => comment._id);

  const promises = [];

  promises.push(Reply.deleteMany({ comment: { $in: deletedCommentsId } }));

  deletedCommentsId.forEach((commentId) => {
    promises.push(
      Post.updateMany({ comments: { $elemMatch: { $eq: commentId } } }, { $pull: { comments: commentId } })
    );
  });

  await Promise.all(promises);

  next();
});

CommentSchema.plugin(autopopulate);

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
