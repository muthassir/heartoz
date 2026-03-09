// server/models/AuditLog.js
// Immutable record of sensitive actions — cannot be modified, only read/created.
const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  action:    { type: String, required: true },   // "LOGIN", "LOGOUT", "JOIN_COUPLE", etc.
  resource:  { type: String, default: null },    // "couple:abc123", "invite:XYZ"
  ip:        { type: String, default: null },
  userAgent: { type: String, default: null },
  success:   { type: Boolean, default: true },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
  // Prevent any updates — audit logs are write-once
  strict: true,
});

// Automatically expire after 90 days
auditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("AuditLog", auditSchema);