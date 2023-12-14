const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema } = mongoose;

const TokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    token: String,
  },
  { timestamps: true }
);

TokenSchema.plugin(autopopulate);

const Token = mongoose.model("Token", TokenSchema);
module.exports = Token;
