// server/models/Invite.js
const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    // 6-char uppercase alphanumeric code — unambiguous chars only (no 0/O, 1/I/L)
    code:        { type: String, required: true, unique: true, uppercase: true, maxlength: 6 },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    creatorName: { type: String, maxlength: 100 },
    expiresAt:   { type: Date, required: true },
    used:        { type: Boolean, default: false },
    usedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// MongoDB TTL index — automatically deletes expired invite documents
// so the collection never accumulates stale codes
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Invite", inviteSchema);