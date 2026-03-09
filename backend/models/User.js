// server/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId:  { type: String, required: true, unique: true },
    name:      { type: String, required: true, maxlength: 100 },
    email:     { type: String, required: true, unique: true, lowercase: true },
    photo:     { type: String, default: "" },
    coupleId:  { type: mongoose.Schema.Types.ObjectId, ref: "Couple", default: null },

    // Set to current Date when user clicks "revoke all sessions".
    // Any JWT with iat * 1000 < tokenIssuedBefore is rejected — even if valid.
    tokenIssuedBefore: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);