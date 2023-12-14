const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    content: {
      type: String,
      require: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      autopopulate: {
        maxDepth: 1,
      },
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      autopopulate: {
        maxDepth: 1,
      },
    },
    isRead: Boolean,
  },
  { timestamps: true }
);

NotificationSchema.plugin(autopopulate);

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
