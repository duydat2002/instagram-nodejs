const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema, Types } = mongoose;

const conversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["duo", "group"],
      required: true,
    },
    groupName: {
      type: String,
      required: function () {
        return this.type == "group";
      },
      default: null,
    },
    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      validate: {
        validator: function (array) {
          return Array.isArray(array) && array.length >= 2;
        },
        message: "The members must have at least 2 elements.",
      },
      autopopulate: {
        select: "_id username avatar isOnline lastOnline",
        maxDepth: 1,
      },
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      autopopulate: {
        select: "_id author type content createdAt",
        maxDepth: 1,
      },
    },
  },
  { timestamps: true }
);

conversationSchema.plugin(autopopulate);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
