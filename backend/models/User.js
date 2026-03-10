// server/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Firebase UID replaces googleId — this is the primary identifier
    firebaseUid: { type: String, required: true, unique: true },
    name:        { type: String, required: true, maxlength: 100 },
    email:       { type: String, required: true, unique: true, lowercase: true },
    photo:       { type: String, default: "" },
    coupleId:    { type: mongoose.Schema.Types.ObjectId, ref: "Couple", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);