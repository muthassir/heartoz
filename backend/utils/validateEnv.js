// server/utils/validateEnv.js
// Validates all required environment variables at startup.
// Crashes immediately with a clear message if anything is wrong.
// A misconfigured server is more dangerous than a crashed one.

const crypto = require("crypto");

const REQUIRED = [
  "MONGODB_URI",
  "JWT_SECRET",
  "SESSION_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "CLIENT_URL",
];

const validateEnv = () => {
  const errors = [];

  // ── Check required vars exist ────────────────────────────────────────────
  for (const key of REQUIRED) {
    if (!process.env[key] || process.env[key].trim() === "") {
      errors.push(`Missing required env var: ${key}`);
    }
  }

  if (errors.length) {
    console.error("\n🚨 ENVIRONMENT CONFIGURATION ERRORS:\n");
    errors.forEach(e => console.error(`  ✗ ${e}`));
    console.error("\nCopy server/.env.example to server/.env and fill in all values.\n");
    process.exit(1);
  }

  // ── Check secret strength ────────────────────────────────────────────────
  const warnings = [];

  if (process.env.JWT_SECRET.length < 32) {
    warnings.push("JWT_SECRET is too short — use at least 32 characters (64 recommended).");
  }
  if (process.env.SESSION_SECRET.length < 32) {
    warnings.push("SESSION_SECRET is too short — use at least 32 characters.");
  }

  // Check for placeholder/default values
  const placeholders = ["secret", "password", "changeme", "example", "replace", "your_", "<"];
  for (const key of ["JWT_SECRET", "SESSION_SECRET"]) {
    const val = process.env[key].toLowerCase();
    if (placeholders.some(p => val.includes(p))) {
      warnings.push(`${key} looks like a placeholder — use a real random secret.`);
    }
  }

  // In production, enforce strict rules
  if (process.env.NODE_ENV === "production") {
    if (!process.env.CLIENT_URL.startsWith("https://")) {
      warnings.push("CLIENT_URL must use HTTPS in production.");
    }
    if (!process.env.MONGODB_URI.includes("mongodb+srv://")) {
      warnings.push("MONGODB_URI should use Atlas (mongodb+srv://) in production.");
    }
  }

  if (warnings.length) {
    console.warn("\n⚠️  SECURITY WARNINGS:\n");
    warnings.forEach(w => console.warn(`  ⚠  ${w}`));
    console.warn("");
    // Don't exit on warnings — just alert
  }

  console.log("✅ Environment validated.");
};

// ── Helper: generate a secure secret (run once to get values for .env) ────
const generateSecret = () => crypto.randomBytes(64).toString("hex");

module.exports = { validateEnv, generateSecret };