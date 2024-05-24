const mongoose = require("mongoose");
const { isEmail } = require("validator");
const autopopulate = require("mongoose-autopopulate");
const bcrypt = require("bcrypt");
const { deleteFolderStorage } = require("@/handlers/firebaseUpload");
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
      minlength: [8, "Minimum password length is 8 characters."],
    },
    fullname: String,
    avatar: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/instagram-storage-bc9c9.appspot.com/o/default%2Favatar.png?alt=media&token=ede62662-a16f-4e37-a950-4921aaba5379",
    },
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
    isOnline: {
      type: Boolean,
      default: true,
    },
    lastOnline: {
      type: Date,
      default: new Date(),
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

UserSchema.pre(["deleteOne", "findOneAndDelete"], async function (next) {
  const Token = mongoose.model("Token");
  const User = mongoose.model("User");
  const Post = mongoose.model("Post");
  const Comment = mongoose.model("Comment");
  const Reply = mongoose.model("Reply");

  const deletedUser = this.getQuery();
  const deletedUserId = deletedUser._id;

  await Promise.all([
    Token.deleteMany({ user: deletedUserId }),
    Post.deleteMany({ author: deletedUserId }),
    Comment.deleteMany({ author: deletedUserId }),
    Reply.deleteMany({ author: deletedUserId }),
    User.updateMany(
      {
        $or: [
          { followers: { $elemMatch: { $eq: deletedUserId } } },
          { followings: { $elemMatch: { $eq: deletedUserId } } },
        ],
      },
      { $pull: { followers: deletedUserId, followings: deletedUserId } }
    ),
    Post.updateMany(
      { $or: [{ tags: { $elemMatch: { $eq: deletedUserId } } }, { likes: { $elemMatch: { $eq: deletedUserId } } }] },
      { $pull: { tags: deletedUserId, likes: deletedUserId } }
    ),
    Comment.updateMany({ likes: { $elemMatch: { $eq: deletedUserId } } }, { $pull: { likes: deletedUserId } }),
    Reply.updateMany({ likes: { $elemMatch: { $eq: deletedUserId } } }, { $pull: { likes: deletedUserId } }),
    deleteFolderStorage(deletedUserId),
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
    err.message = "No accounts registered with this email.";
    err.keyValue = "email";
    throw err;
  }
};

UserSchema.plugin(autopopulate);

const User = mongoose.model("User", UserSchema);

// Notification
// const watchNoti = {
//   filter: [
//     {
//       $match: {
//         $and: [{ "updateDescription.updatedFields.followings": { $exists: true } }],
//       },
//     },
//   ],
//   options: { fullDocument: "whenAvailable" },
// };

// User.watch([], { fullDocument: "updateLookup" }).on("change", (data) => {
//   console.log(data);
//   if (operationType == 'update') {
//     if (updateDescription.updatedFields.following) {

//     }
//   }
// });

// {
//   _id: {
//     _data: '82663199CA0000000B2B042C0100296E5A1004B6CAEF8AFF844EE4B9E8B5F6BC34601D463C6F7065726174696F6E54797065003C7570646174650046646F63756D656E744B65790046645F69640064658C16A166180974270152DF000004'
//   },
//   operationType: 'update',
//   clusterTime: new Timestamp({ t: 1714526666, i: 11 }),
//   wallTime: 2024-05-01T01:24:26.947Z,
//   fullDocument: {
//     _id: new ObjectId('658c16a166180974270152df'),
//     username: 'phamduydat2002',
//     email: 'phamduydat2002@gmail.com',
//     password: '$2b$10$2MMzcpqmLqCr6uVgPGtM..VSiDN9jzGxCn6qL7rv8GxV9IlcQ/WJu',
//     fullname: 'Phạm Duy Đạt',
//     avatar: 'https://firebasestorage.googleapis.com/v0/b/instagram-storage-bc9c9.appspot.com/o/default%2Favatar.png?alt=media&token=ede62662-a16f-4e37-a950-4921aaba5379',
//     followers: [
//       new ObjectId('658c343f48713ef4aae284d9'),
//       new ObjectId('658b9129e2ef23426b634dfa')
//     ],
//     followings: [],
//     posts: [],
//     saved_posts: [ new ObjectId('6597bf4ce69dd2f5a4b30208') ],
//     tagged_posts: [ new ObjectId('6597bf4ce69dd2f5a4b30208') ],
//     liked_posts: [],
//     isPrivate: false,
//     createdAt: 2023-12-27T12:20:49.754Z,
//     updatedAt: 2024-05-01T01:24:26.817Z,
//     __v: 0
//   },
//   ns: { db: 'Instagram', coll: 'users' },
//   documentKey: { _id: new ObjectId('658c16a166180974270152df') },
//   updateDescription: {
//     updatedFields: {
//       updatedAt: 2024-05-01T01:24:26.817Z,
//       'followers.1': new ObjectId('658b9129e2ef23426b634dfa')
//     },
//     removedFields: [],
//     truncatedArrays: []
//   }
// }

module.exports = User;
