// server/routes/invites.js
const express            = require("express");
const { customAlphabet } = require("nanoid");
const Invite             = require("../models/Invite");
const Couple             = require("../models/Couple");
const User               = require("../models/User");
const { protect, audit } = require("../middlewares/auth");
const { inviteLimiter, writeLimiter } = require("../middlewares/rateLimiter");
const { validateInviteJoin, handleValidation } = require("../middlewares/sanitize");
const logger = require("../utils/logger");

const router = express.Router();
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// ── POST /api/invites ──────────────────────────────────────────────────────
router.post("/", protect, writeLimiter, async (req, res) => {
  try {
    if (req.user.coupleId)
      return res.status(400).json({ message: "You're already in a couple." });

    await Invite.deleteMany({ createdBy: req.user._id, used: false });

    const code   = nanoid();
    const invite = await Invite.create({
      code,
      createdBy:   req.user._id,
      creatorName: req.user.name,
      expiresAt:   new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    audit(req, "INVITE_CREATED", { resource: `invite:${code}` });
    logger.info("Invite created", { userId: req.user._id, requestId: req.requestId });
    res.status(201).json({ code: invite.code, expiresAt: invite.expiresAt });
  } catch (err) {
    logger.error("Create invite error", { error: err.message });
    res.status(500).json({ message: "Failed to create invite." });
  }
});

// ── POST /api/invites/join ─────────────────────────────────────────────────
router.post("/join", protect, inviteLimiter, validateInviteJoin, handleValidation,
  async (req, res) => {
    const GENERIC_ERROR = "Invalid or expired invite code.";
    try {
      const normalised = req.body.code.trim().toUpperCase();

      // Find invite by code
      const realInvite = await Invite.findOne({ code: normalised, used: false });

      if (!realInvite || realInvite.expiresAt < new Date()) {
        logger.security("Invalid invite join attempt", { ip: req.ip, userId: req.user._id });
        audit(req, "INVITE_JOIN_FAILED", { success: false });
        return res.status(400).json({ message: GENERIC_ERROR });
      }

      if (realInvite.createdBy.equals(req.user._id))
        return res.status(400).json({ message: "You can't join your own invite!" });

      if (req.user.coupleId)
        return res.status(400).json({ message: "You're already in a couple." });

      const creator = await User.findById(realInvite.createdBy);
      if (!creator || creator.coupleId)
        return res.status(400).json({ message: GENERIC_ERROR });

      // Create couple
      const couple = await Couple.create({
        members: [realInvite.createdBy, req.user._id],
        scores: {
          [realInvite.createdBy.toString()]: 0,
          [req.user._id.toString()]:         0,
        },
      });

      // Update both users — use separate saves to avoid $in with sanitizeFilter
      await User.findByIdAndUpdate(realInvite.createdBy, { coupleId: couple._id });
      await User.findByIdAndUpdate(req.user._id,         { coupleId: couple._id });

      await Invite.findByIdAndUpdate(realInvite._id, { used: true, usedBy: req.user._id });

      const partner = await User.findById(realInvite.createdBy).select("name email photo");

      audit(req, "COUPLE_JOINED", { resource: `couple:${couple._id}` });
      logger.info("Couple formed", { coupleId: couple._id, requestId: req.requestId });

      res.status(201).json({
        coupleId: couple._id,
        partner:  { id: partner._id, name: partner.name, photo: partner.photo },
      });
    } catch (err) {
      logger.error("Join invite error", { error: err.message });
      res.status(500).json({ message: "Failed to join." });
    }
  }
);

module.exports = router;