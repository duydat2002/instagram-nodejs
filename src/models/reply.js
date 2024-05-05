const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema, Types } = mongoose;

const replySchema = new Schema(
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
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
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
  },
  { timestamps: true }
);

replySchema.pre(["deleteOne", "findOneAndDelete"], async function (next) {
  const Comment = mongoose.model("Comment");
  const deletedReply = this.getQuery();

  await Comment.updateMany(
    { replies: { $elemMatch: { $eq: deletedReply._id } } },
    { $pull: { replies: deletedReply._id } }
  );

  next();
});

replySchema.plugin(autopopulate);

const Reply = mongoose.model("Reply", replySchema);
module.exports = Reply;
