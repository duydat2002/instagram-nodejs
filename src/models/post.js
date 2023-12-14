const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
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
      default: [""],
    },
    type: {
      type: String,
      enum: ["image", "video", "reel", "multiple"],
      require: true,
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
    ratio: Number,
  },
  { timestamps: true }
);

PostSchema.plugin(autopopulate);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
