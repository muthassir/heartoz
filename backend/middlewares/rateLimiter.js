// server/middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");
const logger    = require("../utils/logger");

const hit = (label) => (req, res, next, options) => {
  logger.security(`Rate limit hit: ${label}`, {
    ip: req.ip, path: req.path,
    ua: req.headers["user-agent"]?.slice(0, 80),
    requestId: req.requestId,
  });
  res
    .set("Retry-After", Math.ceil(options.windowMs / 1000))
    .status(429)
    .json({ message: options.message.message });
};

// ── Global — 300 req/15min/IP ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 300,
  standardHeaders: true, legacyHeaders: false,
  message: { message: "Too many requests. Slow down." },
  handler: hit("global"),
});

// ── Auth — 10 failures/15min/IP ────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
  handler: hit("auth"),
});

// ── Invite join — 5 attempts/hour/IP ──────────────────────────────────────
const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { message: "Too many invite attempts. Try again in an hour." },
  handler: hit("invite"),
});

// ── API writes — 100/15min/IP ──────────────────────────────────────────────
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  skip: (req) => req.method === "GET",
  message: { message: "Too many write requests. Slow down." },
  handler: hit("write"),
});

// ── Image uploads — 20/hour/IP ────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { message: "Too many uploads. Try again in an hour." },
  handler: hit("upload"),
});

module.exports = { globalLimiter, authLimiter, inviteLimiter, writeLimiter, uploadLimiter };