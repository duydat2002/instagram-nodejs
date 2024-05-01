const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      requried: [true, "Recipient is required."],
    },
    type: {
      type: String,
      enum: {
        values: ["like", "comment", "follow", "tag", "mention"],
        message: "Post type must be in ['like', 'comment', 'follow', 'tag', 'mention']",
      },
    },
    content: {
      type: String,
      require: [true, "Content is required."],
    },
    data: {
      type: Object,
    },
    isRead: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

NotificationSchema.plugin(autopopulate);

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
