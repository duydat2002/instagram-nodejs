const { deleteFolderStorage } = require("@/handlers/firebaseUpload");
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
        select: "_id username avatar",
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

PostSchema.pre(["deleteOne", "findOneAndDelete", "deleteMany"], async function (next) {
  const User = mongoose.model("User");
  const Post = mongoose.model("Post");
  const Comment = mongoose.model("Comment");

  const deletedPosts = await Post.find(this.getFilter(), { _id: 1, author: 1 }).lean();
  const deletedPostsId = deletedPosts.map((post) => post._id);

  const promises = [];

  promises.push(Comment.deleteMany({ post: { $in: deletedPostsId } }));

  deletedPosts.forEach((post) => {
    promises.push(
      User.updateMany({ posts: { $elemMatch: { $eq: post._id } } }, { $pull: { posts: post._id } }),
      User.updateMany({ saved_posts: { $elemMatch: { $eq: post._id } } }, { $pull: { saved_posts: post._id } }),
      User.updateMany({ tagged_posts: { $elemMatch: { $eq: post._id } } }, { $pull: { tagged_posts: post._id } }),
      User.updateMany({ liked_posts: { $elemMatch: { $eq: post._id } } }, { $pull: { liked_posts: post._id } })
    );
    promises.push(deleteFolderStorage(`${post.author}/posts/${post._id}`));
  });

  await Promise.all(promises);

  next();
});

PostSchema.plugin(autopopulate);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
