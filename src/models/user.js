const mongoose = require("mongoose");
const { isEmail } = require("validator");
const autopopulate = require("mongoose-autopopulate");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const { Schema, Types } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "Username is required."],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required."],
      validate: [isEmail, "Email is invalid."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Minimum password length is 8 characters"],
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

UserSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], async function (next) {
  const Token = mongoose.model("Token");
  const User = mongoose.model("User");
  const Post = mongoose.model("Post");
  const Comment = mongoose.model("Comment");

  const user = this.getQuery();

  const userId = new Types.ObjectId(user._id);

  await Promise.all([
    Token.deleteMany({ user: userId }),
    User.updateMany(
      { $or: [{ followers: { $elemMatch: { $eq: userId } } }, { followings: { $elemMatch: { $eq: userId } } }] },
      { $pull: { followers: userId, followings: userId } }
    ),
    Post.deleteMany({ author: userId }),
    Post.updateMany(
      { $or: [{ tags: { $elemMatch: { $eq: userId } } }, { likes: { $elemMatch: { $eq: userId } } }] },
      { $pull: { tags: userId, likes: userId } }
    ),
    Comment.deleteMany({ user: userId }),
    Comment.updateMany({ likes: { $elemMatch: { $eq: userId } } }, { $pull: { likes: userId } }),
  ]);

  next();
});

UserSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ $or: [{ email: email }, { username: email }] });
  const err = new Error("");
  err.name = "MyError";

  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    } else {
      err.message = "Incorrect password.";
      err.keyValue = "password";
      throw err;
    }
  } else {
    err.message = "No account with this email has been registered.";
    err.keyValue = "email";
    throw err;
  }
};

UserSchema.plugin(autopopulate);

const User = mongoose.model("User", UserSchema);
module.exports = User;
