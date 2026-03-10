// server/routes/auth.js
const express        = require("express");
const admin          = require("firebase-admin");
const User           = require("../models/User");
const { protect, audit } = require("../middlewares/auth");
const { authLimiter }    = require("../middlewares/rateLimiter");
const logger             = require("../utils/logger");

const router = express.Router();

// ── POST /api/auth/sync ────────────────────────────────────────────────────
// Called after Firebase login — verifies Firebase token, creates/updates user in MongoDB
router.post("/sync", authLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify token with Firebase Admin SDK
    const decoded = await admin.auth().verifyIdToken(idToken);

    const { uid, email, name, picture } = decoded;

    // Upsert user — create if new, update if existing
    let user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        firebaseUid: uid,
        name:        name?.slice(0, 100) || "User",
        email:       email?.toLowerCase(),
        photo:       picture || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info("User synced", { userId: user._id, email: user.email });
    audit(req, "LOGIN_FIREBASE", { resource: `user:${user._id}` });

    res.json({
      id:       user._id,
      name:     user.name,
      email:    user.email,
      photo:    user.photo,
      coupleId: user.coupleId,
    });
  } catch (err) {
    logger.error("Auth sync error", { error: err.message });
    if (err.code?.startsWith("auth/")) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    res.status(500).json({ message: "Auth failed." });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────
router.get("/me", protect, (req, res) => {
  res.json({
    id:       req.user._id,
    name:     req.user.name,
    email:    req.user.email,
    photo:    req.user.photo,
    coupleId: req.user.coupleId,
  });
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────
// Firebase handles token invalidation — we just log it
router.post("/logout", protect, (req, res) => {
  audit(req, "LOGOUT", { resource: `user:${req.user._id}` });
  logger.info("User logged out", { userId: req.user._id });
  res.json({ message: "Logged out." });
});

module.exports = router;