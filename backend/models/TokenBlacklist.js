// server/models/TokenBlacklist.js
// JWTs are stateless, but we need to invalidate them on logout/suspicious activity.
// We store revoked token JTIs (unique IDs) with a TTL matching the token expiry.
const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
  jti:       { type: String, required: true, unique: true, index: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expiresAt: { type: Date, required: true },
  reason:    { type: String, default: "logout" }, // logout | suspicious | password_change
}, { timestamps: true });

// Auto-delete expired tokens — MongoDB TTL index
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);