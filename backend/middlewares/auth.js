// server/middleware/auth.js
const passport        = require("passport");
const jwt             = require("jsonwebtoken");
const TokenBlacklist  = require("../models/TokenBlacklist");
const AuditLog        = require("../models/AuditLog");
const logger          = require("../utils/logger");

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

// ── protect — verify JWT + check blacklist ────────────────────────────────
const protect = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      logger.security("JWT auth failed", {
        ip: getIP(req), path: req.path,
        info: info?.message, requestId: req.requestId,
      });
      return res.status(401).json({ message: "Unauthorised — please log in." });
    }

    try {
      const token   = req.headers.authorization?.split(" ")[1];
      const decoded = jwt.decode(token);
      if (decoded?.jti) {
        const blacklisted = await TokenBlacklist.findOne({ jti: decoded.jti }).lean();
        if (blacklisted) {
          logger.security("Blacklisted token used", {
            ip: getIP(req), userId: user._id,
            jti: decoded.jti, reason: blacklisted.reason,
          });
          return res.status(401).json({ message: "Session expired. Please log in again." });
        }
      }

      // Check tokenIssuedBefore — catches "revoke all sessions"
      if (user.tokenIssuedBefore && decoded?.iat) {
        if (decoded.iat * 1000 < user.tokenIssuedBefore.getTime()) {
          logger.security("Pre-revocation token used", { userId: user._id });
          return res.status(401).json({ message: "Session expired. Please log in again." });
        }
      }
    } catch (e) {
      logger.error("Token check failed", { error: e.message });
    }

    req.user = user;
    next();
  })(req, res, next);
};

// ── coupleGuard — must be a member of the requested couple ────────────────
const coupleGuard = (req, res, next) => {
  const coupleId = req.params.coupleId;
  if (!coupleId) return res.status(400).json({ message: "Couple ID required." });

  if (!req.user.coupleId || req.user.coupleId.toString() !== coupleId) {
    logger.security("Unauthorised couple access attempt", {
      ip: getIP(req), userId: req.user._id,
      requestedCouple: coupleId, userCouple: req.user.coupleId?.toString(),
    });
    audit(req, "COUPLE_ACCESS_DENIED", { resource: `couple:${coupleId}`, success: false });
    return res.status(403).json({ message: "Forbidden." });
  }
  next();
};

// ── suspiciousActivity — block known attack tools and patterns ────────────
const SCANNER_UAS = [
  "sqlmap","nikto","nmap","masscan","burpsuite","dirbuster","hydra",
  "metasploit","acunetix","nessus","openvas","zaproxy","wfuzz","gobuster",
  "nuclei","feroxbuster","ffuf","dirb","whatweb","w3af","arachni","skipfish",
  "commix","havij","pangolin","bsqlbf","bbqsql","autoSQLi",
  // Generic automation (only block in prod to allow dev testing)
  ...(process.env.NODE_ENV === "production" ? ["python-requests","go-http-client","curl/","wget/","libwww"] : []),
];

const INJECTION_PATTERNS = [
  // SQL
  /(\bunion\b.+\bselect\b|\bdrop\b.+\btable\b|\binsert\b.+\binto\b|\bdelete\b.+\bfrom\b)/i,
  // Script injection
  /<\s*script|javascript\s*:/i,
  // Path traversal
  /(\.\.(\/|\\|%2f|%5c)|%252e%252e)/i,
  // SSRF probes
  /\b(localhost|127\.0\.0\.1|0\.0\.0\.0|169\.254\.169\.254|::1)\b/i,
  // XXE / XML
  /<!ENTITY|<!DOCTYPE.*\[/i,
  // Template injection
  /\{\{.*\}\}|\$\{.*\}/,
];

const suspiciousActivity = (req, res, next) => {
  const ua    = (req.headers["user-agent"] || "").toLowerCase();
  const probe = req.path + req.originalUrl + JSON.stringify(req.query);
  const flags = [];

  if (SCANNER_UAS.some(s => ua.includes(s)))
    flags.push(`scanner_ua:${ua.slice(0, 60)}`);

  if (INJECTION_PATTERNS.some(p => p.test(probe)))
    flags.push("injection_pattern");

  // Unusually long headers (header injection / buffer overflow probe)
  const totalHeaderLen = Object.values(req.headers).join("").length;
  if (totalHeaderLen > 8000) flags.push("oversized_headers");

  // Unexpected HTTP methods
  if (!["GET","POST","PATCH","DELETE","OPTIONS","HEAD"].includes(req.method))
    flags.push(`unusual_method:${req.method}`);

  if (flags.length) {
    logger.security("Suspicious request blocked", {
      ip: getIP(req), path: req.path, flags, requestId: req.requestId,
    });
    audit(req, "SUSPICIOUS_REQUEST", { meta: { flags }, success: false });
    return res.status(400).json({ message: "Bad request." });
  }
  next();
};

module.exports = { protect, coupleGuard, suspiciousActivity, audit, getIP };