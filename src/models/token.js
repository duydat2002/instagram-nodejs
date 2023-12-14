const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema } = mongoose;

const TokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    token: {
      type: String,
      requried: [true, "Refresh token is required."],
    },
    expiryAt: Date,
  },
  { timestamps: true }
);

TokenSchema.pre("save", function (next) {
  if (!this.expiryAt || this.isModified("createdAt")) {
    this.expiryAt = new Date(
      this.createdAt.getTime() + parseInt(process.env.REFRESH_TOKEN_LIFE)
    );
  }
  next();
});

TokenSchema.index({ expiryAt: 1 }, { expireAfterSeconds: 0 });

TokenSchema.plugin(autopopulate);

const Token = mongoose.model("Token", TokenSchema);
module.exports = Token;
