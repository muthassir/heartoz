    // server/models/Couple.js
const mongoose = require("mongoose");

// ── Sub-schemas ────────────────────────────────────────────────────────────

const bucketSchema = new mongoose.Schema({
  title:    { type: String, required: true, maxlength: 200 },
  category: {
    type: String,
    enum: ["travel","experience","milestone","adventure","food","creative"],
    default: "experience",
  },
  priority: { type: String, enum: ["high","medium","low"], default: "medium" },
  note:     { type: String, default: "", maxlength: 1000 },
  done:     { type: Boolean, default: false },
}, { timestamps: true });

const memorySchema = new mongoose.Schema({
  title:    { type: String, required: true, maxlength: 200 },
  date:     { type: String, default: null },   // ISO date string e.g. "2024-06-14"
  note:     { type: String, default: "", maxlength: 2000 },
  tag:      { type: String, default: "Just Because", maxlength: 50 },
  mood:     { type: String, default: "🥰", maxlength: 10 },
  imageUrl: { type: String, default: null },   // base64 data URI
}, { timestamps: true });

// ── Main Couple schema ─────────────────────────────────────────────────────
const coupleSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // A–Z dates: { "A": { done: true, photo: "data:image/...", doneAt: "Jun 14, 2025" } }
    dates: {
      type: Map,
      of: new mongoose.Schema({
        done:   { type: Boolean, default: false },
        photo:  { type: String, default: null },    // base64 data URI
        doneAt: { type: String, default: null },    // human-readable date string
      }, { _id: false }),
      default: {},
    },

    buckets:  { type: [bucketSchema], default: [] },
    memories: { type: [memorySchema], default: [] },

    // Game scores keyed by userId string: { "abc123": 30, "def456": 50 }
    scores: {
      type: Map,
      of:   Number,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Couple", coupleSchema);