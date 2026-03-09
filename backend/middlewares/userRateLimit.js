// server/middleware/userRateLimit.js
// IP-based rate limits can be bypassed by rotating IPs (VPN, Tor, botnets).
// Per-user limits apply AFTER authentication and are tied to the user's MongoDB ID,
// which cannot be rotated without a new account.

const rateLimit          = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const logger             = require("../utils/logger");

// ── Per-user write limiter ─────────────────────────────────────────────────
// 60 write operations per 10 minutes per authenticated user
const userWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max:      60,
  standardHeaders: true,
  legacyHeaders:   false,
  // Key by user ID when authenticated — falls back to IPv6-safe IP key
  keyGenerator: (req) => {
    if (req.user?._id) return `user:${req.user._id.toString()}`;
    return ipKeyGenerator(req); // IPv6-safe fallback
  },
  skip: (req) => req.method === "GET",
  message: { message: "You're sending too many requests. Please slow down." },
  handler: (req, res, next, options) => {
    logger.security("Per-user write rate limit hit", {
      userId: req.user?._id,
      ip:     req.ip,
      path:   req.path,
    });
    res.status(429).json(options.message);
  },
});

// ── Per-user image upload limiter ─────────────────────────────────────────
// 10 image uploads per hour per authenticated user
const userUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => req.user?._id
    ? `upload:${req.user._id.toString()}`
    : ipKeyGenerator(req), // IPv6-safe fallback
  message: { message: "Upload limit reached. Try again in an hour." },
  handler: (req, res, next, options) => {
    logger.security("Per-user upload rate limit hit", {
      userId: req.user?._id,
      ip:     req.ip,
    });
    res.status(429).json(options.message);
  },
});

module.exports = { userWriteLimiter, userUploadLimiter };