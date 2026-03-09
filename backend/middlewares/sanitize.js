// server/middleware/sanitize.js
const xss = require("xss");
const hpp = require("hpp");
const { body, param, validationResult } = require("express-validator");

// ── 1. NoSQL Injection protection (manual — avoids req.query setter bug) ──
// Removes any keys containing $ or . from objects recursively
const sanitizeNoSQL = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeNoSQL);
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([k]) => !k.startsWith("$") && !k.includes("."))
      .map(([k, v]) => [k, sanitizeNoSQL(v)])
  );
};

const noSQLSanitize = (req, res, next) => {
  try {
    if (req.body)   req.body   = sanitizeNoSQL(req.body);
    if (req.params) req.params = sanitizeNoSQL(req.params);
    // Don't overwrite req.query directly — read-only in newer Express
    // Instead check and block if injection found
    if (req.query) {
      const queryStr = JSON.stringify(req.query);
      if (queryStr.includes("$") || /\.\$/.test(queryStr)) {
        const logger = require("../utils/logger");
        logger.security("NoSQL injection attempt in query blocked", {
          ip: req.ip, path: req.path,
        });
        return res.status(400).json({ message: "Bad request." });
      }
    }
  } catch (e) {
    // Don't crash on sanitize errors
  }
  next();
};


// ── 2. XSS — strip all HTML/JS from every string field recursively ────────
const xssSanitizeValue = (val) => {
  if (typeof val === "string") return xss(val, { whiteList: {}, stripIgnoreTag: true });
  if (Array.isArray(val))      return val.map(xssSanitizeValue);
  if (val && typeof val === "object")
    return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, xssSanitizeValue(v)]));
  return val;
};

const xssSanitize = (req, res, next) => {
  if (req.body)  req.body  = xssSanitizeValue(req.body);
  // req.query is read-only in newer Express — skip direct assignment
  next();
};

// ── 3. HTTP Parameter Pollution ────────────────────────────────────────────
const hppProtect = hpp();

// ── 4. JSON depth bomb protection ─────────────────────────────────────────
// Deeply-nested JSON can exhaust the parser's stack — cap at 5 levels deep
const maxDepth = (obj, depth = 0) => {
  if (depth > 5) throw new Error("Request body is too deeply nested.");
  if (obj && typeof obj === "object") {
    Object.values(obj).forEach(v => maxDepth(v, depth + 1));
  }
};

const depthGuard = (req, res, next) => {
  try {
    if (req.body) maxDepth(req.body);
    next();
  } catch {
    return res.status(400).json({ message: "Invalid request structure." });
  }
};

// ── 5. Invite code validation ──────────────────────────────────────────────
const validateInviteJoin = [
  body("code")
    .trim()
    .toUpperCase()
    .isLength({ min: 6, max: 6 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage("Invalid invite code format."),
];

// ── 6. Bucket validation ───────────────────────────────────────────────────
const validateBucket = [
  body("title").trim().isLength({ min: 1, max: 200 })
    .withMessage("Title must be 1–200 characters."),
  body("category").optional()
    .isIn(["travel","experience","milestone","adventure","food","creative"])
    .withMessage("Invalid category."),
  body("priority").optional()
    .isIn(["high","medium","low"])
    .withMessage("Invalid priority."),
  body("note").optional().trim().isLength({ max: 1000 })
    .withMessage("Note too long (max 1000 chars)."),
  body("done").optional().isBoolean().withMessage("done must be boolean."),
];

// ── 7. Memory validation ───────────────────────────────────────────────────
const validateMemory = [
  body("title").trim().isLength({ min: 1, max: 200 })
    .withMessage("Title must be 1–200 characters."),
  body("date").optional().isISO8601().withMessage("Invalid date format."),
  body("note").optional().trim().isLength({ max: 2000 })
    .withMessage("Note too long (max 2000 chars)."),
  body("tag").optional().trim().isLength({ max: 50 })
    .withMessage("Tag too long."),
  body("mood").optional().trim().isLength({ max: 10 })
    .withMessage("Invalid mood."),
  body("imageUrl").optional().custom((val) => {
    if (!val) return true;
    if (typeof val !== "string")         throw new Error("Invalid image.");
    if (val.length > 5 * 1024 * 1024)   throw new Error("Image too large (max 5MB).");
    if (!val.startsWith("data:image/"))  throw new Error("Only base64 images allowed.");
    const m = val.match(/^data:(image\/[a-z]+);base64,/);
    if (!m) throw new Error("Invalid image format.");
    if (!["image/jpeg","image/png","image/webp","image/gif"].includes(m[1]))
      throw new Error("Only JPEG, PNG, WEBP, GIF allowed.");
    return true;
  }),
];

// ── 8. Score validation ────────────────────────────────────────────────────
const validateScore = [
  body("userId").trim().isMongoId().withMessage("Invalid userId."),
  body("points").isInt({ min: 0, max: 100 }).withMessage("Points must be 0–100."),
];

// ── 9. Param validators ────────────────────────────────────────────────────
const validateCoupleId = [
  param("coupleId").isMongoId().withMessage("Invalid couple ID."),
];

const validateLetter = [
  param("letter").isLength({ min: 1, max: 1 }).matches(/^[A-Z]$/)
    .withMessage("Invalid letter."),
];

const validateMongoId = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}.`),
];

// ── 10. Validation result handler ──────────────────────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed.",
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = {
  noSQLSanitize, xssSanitize, hppProtect, depthGuard,
  validateInviteJoin, validateBucket, validateMemory, validateScore,
  validateCoupleId, validateLetter, validateMongoId, handleValidation,
};