const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema, Types } = mongoose;

const PostSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required."],
      autopopulate: {
        maxDepth: 1,
      },
    },
    caption: {
      type: String,
      default: "",
    },
    contents: {
      type: [String],
      required: [true, "Content is required."],
    },
    type: {
      type: String,
      enum: {
        values: ["image", "video", "reel", "multiple"],
        message: "Post type must be in ['image', 'video', 'reel', 'multiple']",
      },
      required: [true, "Post type is required."],
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        // autopopulate: {
        //   maxDepth: 1,
        // },
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        // autopopulate: {
        //   maxDepth: 1,
        // },
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        // autopopulate: {
        //   maxDepth: 1,
        // },
      },
    ],
    ratio: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

PostSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], async function (next) {
  const User = mongoose.model("User");
  const Comment = mongoose.model("Comment");

  const post = this.getQuery();
  const commentsId = post.comments.map((comment) => new Types.ObjectId(comment));

  await Promise.all([
    Comment.deleteMany({ _id: { $in: commentsId } }),
    User.updateMany({ liked_posts: { $elemMatch: { $eq: post._id } } }, { $pull: { liked_posts: post._id } }),
  ]);

  next();
});

PostSchema.plugin(autopopulate);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
