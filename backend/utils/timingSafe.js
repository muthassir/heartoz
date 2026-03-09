// server/utils/timingSafe.js
// Normal string comparison (===) short-circuits on the first mismatch.
// An attacker can measure response time to determine how many characters matched —
// this is called a "timing oracle" attack. Crypto-grade comparison takes the SAME
// time regardless of where the mismatch occurs, defeating this attack.

const crypto = require("crypto");

/**
 * Timing-safe string equality check.
 * Use this for: invite codes, tokens, secrets — anything security-sensitive.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
const timingSafeEqual = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;

  // Both strings must be same byte-length for timingSafeEqual.
  // We hash both to normalize length and prevent length-based oracle.
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();

  try {
    return crypto.timingSafeEqual(ha, hb);
  } catch {
    return false;
  }
};

module.exports = { timingSafeEqual };