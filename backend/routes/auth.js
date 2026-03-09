// server/routes/auth.js
const express        = require("express");
const jwt            = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const passport       = require("passport");
const TokenBlacklist = require("../models/TokenBlacklist");
const { protect, audit, getIP } = require("../middlewares/auth");
const { authLimiter } = require("../middlewares/rateLimiter");
const logger         = require("../utils/logger");

const router = express.Router();

// ── Sign JWT with JTI (unique token ID) for revocation support ─────────────
const signToken = (user) => {
  const jti       = uuidv4();
  const expiresIn = process.env.JWT_EXPIRES_IN || "30d";
  const token     = jwt.sign(
    { id: user._id, jti },
    process.env.JWT_SECRET,
    {
      expiresIn,
      issuer:   "az-date-api",
      audience: "az-date-client",
    }
  );
  return { token, jti };
};

// ── GET /api/auth/google ───────────────────────────────────────────────────
router.get("/google",
  authLimiter,
  passport.authenticate("google", {
    scope:   ["profile", "email"],
    session: true,
    // state parameter prevents CSRF during OAuth flow
    state:   uuidv4(),
  })
);

// ── GET /api/auth/google/callback ─────────────────────────────────────────
router.get("/google/callback",
  authLimiter,
  passport.authenticate("google", {
    session:         true,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth`,
  }),
  (req, res) => {
    const { token } = signToken(req.user);

    // Log successful login
    logger.info("User logged in via Google", { userId: req.user._id });
    audit(req, "LOGIN_GOOGLE", { resource: `user:${req.user._id}` });

    // Redirect with token — short-lived, client extracts and stores in memory
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

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
// Blacklists the current JWT so it can never be used again
router.post("/logout", protect, async (req, res) => {
  try {
    const token   = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.decode(token);

    if (decoded?.jti) {
      const expiresAt = new Date(decoded.exp * 1000);
      await TokenBlacklist.create({
        jti:       decoded.jti,
        userId:    req.user._id,
        expiresAt,
        reason:    "logout",
      });
    }

    req.logout?.(() => {});
    audit(req, "LOGOUT", { resource: `user:${req.user._id}` });
    logger.info("User logged out", { userId: req.user._id });

    res.json({ message: "Logged out successfully." });
  } catch (err) {
    logger.error("Logout error", { error: err.message });
    res.status(500).json({ message: "Logout failed." });
  }
});

// ── POST /api/auth/revoke-all ──────────────────────────────────────────────
// Emergency: revoke ALL tokens for this user (e.g. account compromise)
// Since we can't enumerate all JWTs, we update a "tokenIssuedBefore" field on the user.
router.post("/revoke-all", protect, async (req, res) => {
  try {
    const User = require("../models/User");
    await User.findByIdAndUpdate(req.user._id, {
      tokenIssuedBefore: new Date(),
    });
    audit(req, "REVOKE_ALL_TOKENS", { resource: `user:${req.user._id}` });
    logger.security("All tokens revoked for user", { userId: req.user._id });
    res.json({ message: "All sessions revoked. Please log in again." });
  } catch (err) {
    res.status(500).json({ message: "Failed to revoke sessions." });
  }
});

module.exports = router;