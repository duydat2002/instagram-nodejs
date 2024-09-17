const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema, Types } = mongoose;

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "voice"],
      default: "text",
    },
    content: {
      type: String,
      required: true,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

messageSchema.plugin(autopopulate);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
