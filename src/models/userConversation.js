const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema, Types } = mongoose;

const userConversationSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  conversation: {
    type: Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
});

userConversationSchema.plugin(autopopulate);

const UserConversation = mongoose.model("UserConversation", userConversationSchema);
module.exports = UserConversation;
