// server/utils/validateEnv.js
const crypto = require("crypto");

const REQUIRED = [
  "MONGODB_URI",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
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

  // ── Check Firebase vars look valid ───────────────────────────────────────
  const warnings = [];

  if (!process.env.FIREBASE_CLIENT_EMAIL.includes("@")) {
    warnings.push("FIREBASE_CLIENT_EMAIL looks invalid — should be a service account email.");
  }
  if (!process.env.FIREBASE_PRIVATE_KEY.includes("BEGIN PRIVATE KEY")) {
    warnings.push("FIREBASE_PRIVATE_KEY looks invalid — should start with -----BEGIN PRIVATE KEY-----");
  }
  if (process.env.FIREBASE_PROJECT_ID.trim() !== process.env.FIREBASE_PROJECT_ID) {
    warnings.push("FIREBASE_PROJECT_ID has leading/trailing spaces — remove them.");
  }
  if (process.env.FIREBASE_CLIENT_EMAIL.trim() !== process.env.FIREBASE_CLIENT_EMAIL) {
    warnings.push("FIREBASE_CLIENT_EMAIL has leading/trailing spaces — remove them.");
  }

  // ── Production checks ────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "production") {
    if (!process.env.CLIENT_URL.startsWith("https://")) {
      warnings.push("CLIENT_URL must use HTTPS in production.");
    }
    if (!process.env.MONGODB_URI.includes("mongodb+srv://")) {
      warnings.push("MONGODB_URI should use Atlas (mongodb+srv://) in production.");
    }
  }

  if (warnings.length) {
    console.warn("\n⚠️  CONFIGURATION WARNINGS:\n");
    warnings.forEach(w => console.warn(`  ⚠  ${w}`));
    console.warn("");
  }

  console.log("✅ Environment validated.");
};

const generateSecret = () => crypto.randomBytes(64).toString("hex");

module.exports = { validateEnv, generateSecret };