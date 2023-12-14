const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      require: true,
    },
    email: {
      type: String,
      unique: true,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    fullname: String,
    avatar: String,
    bio: String,
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        // autopopulate: {
        //   maxDepth: 1,
        // },
      },
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        // autopopulate: {
        //   maxDepth: 1,
        // },
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        // autopopulate: {
        //   maxDepth: 1,
        // },
      },
    ],
    saved_posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        // autopopulate: {
        //   maxDepth: 1,
        // },
      },
    ],
    tagged_posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        // autopopulate: {
        //   maxDepth: 1,
        // },
      },
    ],
    liked_posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        // autopopulate: {
        //   maxDepth: 1,
        // },
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    const passwordHash = await bcrypt.hash(user.password, saltRounds);

    user.password = passwordHash;
  }

  next();
});

UserSchema.plugin(autopopulate);

const User = mongoose.model("User", UserSchema);
module.exports = User;
