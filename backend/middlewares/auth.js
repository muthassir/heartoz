// server/middlewares/auth.js
const admin       = require("firebase-admin");
const User        = require("../models/User");
const AuditLog    = require("../models/AuditLog");
const logger      = require("../utils/logger");

const getIP = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.socket?.remoteAddress || req.ip;

const audit = (req, action, extra = {}) => {
  AuditLog.create({
    userId:    req.user?._id || null,
    action,
    ip:        getIP(req),
    userAgent: req.headers["user-agent"]?.slice(0, 200),
    requestId: req.requestId,
    ...extra,
  }).catch((e) => logger.error("Audit log write failed", { error: e.message }));
};

// ── protect — verify Firebase token + load user from MongoDB ──────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorised — please log in." });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify with Firebase Admin — handles expiry, revocation automatically
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Load user from MongoDB using Firebase UID
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      return res.status(401).json({ message: "User not found. Please log in again." });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.security("Firebase token verification failed", {
      ip:    getIP(req),
      path:  req.path,
      error: err.message,
    });
    return res.status(401).json({ message: "Unauthorised — please log in." });
  }
};

// ── coupleGuard — must be a member of the requested couple ────────────────
const coupleGuard = (req, res, next) => {
  const coupleId = req.params.coupleId;
  if (!coupleId) return res.status(400).json({ message: "Couple ID required." });

  if (!req.user.coupleId || req.user.coupleId.toString() !== coupleId) {
    logger.security("Unauthorised couple access attempt", {
      ip: getIP(req), userId: req.user._id,
      requestedCouple: coupleId,
    });
    audit(req, "COUPLE_ACCESS_DENIED", { resource: `couple:${coupleId}`, success: false });
    return res.status(403).json({ message: "Forbidden." });
  }
  next();
};

// ── suspiciousActivity — block scanners and injection attempts ────────────
const SCANNER_UAS = [
  "sqlmap","nikto","nmap","masscan","burpsuite","dirbuster","hydra",
  "metasploit","acunetix","nessus","openvas","zaproxy","wfuzz","gobuster",
  "nuclei","feroxbuster","ffuf","dirb","whatweb","w3af","arachni",
];

const INJECTION_PATTERNS = [
  /(\bunion\b.+\bselect\b|\bdrop\b.+\btable\b)/i,
  /<\s*script|javascript\s*:/i,
  /(\.\.(\/|\\|%2f|%5c)|%252e%252e)/i,
  /\b(127\.0\.0\.1|169\.254\.169\.254)\b/i,
  /<!ENTITY|<!DOCTYPE.*\[/i,
];

const suspiciousActivity = (req, res, next) => {
  const ua    = (req.headers["user-agent"] || "").toLowerCase();
  const probe = req.path + req.originalUrl;
  const flags = [];

  if (SCANNER_UAS.some(s => ua.includes(s))) flags.push("scanner_ua");
  if (INJECTION_PATTERNS.some(p => p.test(probe))) flags.push("injection_pattern");
  if (!["GET","POST","PATCH","DELETE","OPTIONS","HEAD"].includes(req.method))
    flags.push(`unusual_method:${req.method}`);

  if (flags.length) {
    logger.security("Suspicious request blocked", { ip: getIP(req), path: req.path, flags });
    return res.status(400).json({ message: "Bad request." });
  }
  next();
};

module.exports = { protect, coupleGuard, suspiciousActivity, audit, getIP };