// server/routes/couples.js
const express  = require("express");
const Couple   = require("../models/Couple");
const User     = require("../models/User");
const { protect, coupleGuard, audit } = require("../middlewares/auth");
const { writeLimiter, uploadLimiter } = require("../middlewares/rateLimiter");
const {
  validateCoupleId,
  validateLetter,
  validateBucket,
  validateMemory,
  handleValidation,
} = require("../middlewares/sanitize");
const logger = require("../utils/logger");

const router = express.Router();
router.use(protect);

// ── GET /api/couples/:coupleId ─────────────────────────────────────────────
router.get("/:coupleId",
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId).lean();
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const partnerId = couple.members.find(id => id.toString() !== req.user._id.toString());
      const partner   = partnerId
        ? await User.findById(partnerId).select("name email photo").lean()
        : null;

      res.json({ couple, partner });
    } catch (err) {
      logger.error("Get couple error", { error: err.message });
      res.status(500).json({ message: "Failed to load couple data." });
    }
  }
);

// ── PATCH /api/couples/:coupleId/dates/:letter ─────────────────────────────
router.patch("/:coupleId/dates/:letter",
  writeLimiter,
  validateCoupleId, validateLetter, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { letter } = req.params;
      const { done, doneAt } = req.body;

      let photo = req.body.photo;
      if (photo !== undefined) {
        if (photo !== null && typeof photo !== "string") {
          return res.status(422).json({ message: "Invalid photo format." });
        }
        if (photo && photo.length > 5 * 1024 * 1024) {
          return res.status(413).json({ message: "Image too large. Max 5MB." });
        }
        if (photo && !photo.startsWith("data:image/")) {
          return res.status(422).json({ message: "Only base64 images allowed." });
        }
      }

      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const existing = couple.dates.get(letter) || {};
      couple.dates.set(letter, {
        done:   done   !== undefined ? Boolean(done)  : existing.done,
        photo:  photo  !== undefined ? photo           : existing.photo,
        doneAt: doneAt !== undefined ? String(doneAt).slice(0, 50) : existing.doneAt,
      });
      await couple.save();

      audit(req, "DATE_UPDATED", { resource: `couple:${couple._id}:date:${letter}` });
      res.json({ letter, date: couple.dates.get(letter) });
    } catch (err) {
      logger.error("Update date error", { error: err.message });
      res.status(500).json({ message: "Failed to update date." });
    }
  }
);

// ── POST /api/couples/:coupleId/buckets ────────────────────────────────────
router.post("/:coupleId/buckets",
  writeLimiter,
  validateCoupleId, validateBucket, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      if (couple.buckets.length >= 200) {
        return res.status(400).json({ message: "Bucket list is full (max 200 items)." });
      }

      const { title, category, priority, note } = req.body;
      couple.buckets.push({ title, category, priority, note });
      await couple.save();

      audit(req, "BUCKET_ADDED", { resource: `couple:${couple._id}` });
      res.status(201).json(couple.buckets[couple.buckets.length - 1]);
    } catch (err) {
      logger.error("Add bucket error", { error: err.message });
      res.status(500).json({ message: "Failed to add bucket item." });
    }
  }
);

// ── PATCH /api/couples/:coupleId/buckets/:bucketId ─────────────────────────
router.patch("/:coupleId/buckets/:bucketId",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const bucket = couple.buckets.id(req.params.bucketId);
      if (!bucket) return res.status(404).json({ message: "Bucket item not found." });

      const allowed = ["title","category","priority","note","done"];
      allowed.forEach(field => {
        if (req.body[field] !== undefined) bucket[field] = req.body[field];
      });

      await couple.save();
      audit(req, "BUCKET_UPDATED", { resource: `couple:${couple._id}:bucket:${bucket._id}` });
      res.json(bucket);
    } catch (err) {
      logger.error("Update bucket error", { error: err.message });
      res.status(500).json({ message: "Failed to update bucket item." });
    }
  }
);

// ── DELETE /api/couples/:coupleId/buckets/:bucketId ────────────────────────
router.delete("/:coupleId/buckets/:bucketId",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      couple.buckets.pull({ _id: req.params.bucketId });
      await couple.save();
      audit(req, "BUCKET_DELETED", { resource: `couple:${couple._id}:bucket:${req.params.bucketId}` });
      res.json({ message: "Deleted." });
    } catch (err) {
      logger.error("Delete bucket error", { error: err.message });
      res.status(500).json({ message: "Failed to delete." });
    }
  }
);

// ── POST /api/couples/:coupleId/memories ───────────────────────────────────
router.post("/:coupleId/memories",
  uploadLimiter,
  validateCoupleId, validateMemory, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      if (couple.memories.length >= 500) {
        return res.status(400).json({ message: "Memory limit reached (max 500)." });
      }

      const { title, date, note, tag, mood, imageUrl } = req.body;
      couple.memories.unshift({ title, date, note, tag, mood, imageUrl: imageUrl || null });
      await couple.save();

      audit(req, "MEMORY_ADDED", { resource: `couple:${couple._id}` });
      res.status(201).json(couple.memories[0]);
    } catch (err) {
      logger.error("Add memory error", { error: err.message });
      res.status(500).json({ message: "Failed to add memory." });
    }
  }
);

// ── PATCH /api/couples/:coupleId/memories/:memoryId ────────────────────────
router.patch("/:coupleId/memories/:memoryId",
  writeLimiter,
  validateCoupleId, validateMemory, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const memory = couple.memories.id(req.params.memoryId);
      if (!memory) return res.status(404).json({ message: "Memory not found." });

      const allowed = ["title","date","note","tag","mood","imageUrl"];
      allowed.forEach(field => {
        if (req.body[field] !== undefined) memory[field] = req.body[field];
      });

      await couple.save();
      audit(req, "MEMORY_UPDATED", { resource: `couple:${couple._id}:memory:${memory._id}` });
      res.json(memory);
    } catch (err) {
      logger.error("Update memory error", { error: err.message });
      res.status(500).json({ message: "Failed to update memory." });
    }
  }
);

// ── DELETE /api/couples/:coupleId/memories/:memoryId ───────────────────────
router.delete("/:coupleId/memories/:memoryId",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      couple.memories.pull({ _id: req.params.memoryId });
      await couple.save();
      audit(req, "MEMORY_DELETED", { resource: `couple:${couple._id}:memory:${req.params.memoryId}` });
      res.json({ message: "Deleted." });
    } catch (err) {
      logger.error("Delete memory error", { error: err.message });
      res.status(500).json({ message: "Failed to delete." });
    }
  }
);

// ── PATCH /api/couples/:coupleId/scores ────────────────────────────────────
router.patch("/:coupleId/scores",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { userId, points } = req.body;

      if (!userId || typeof userId !== "string") {
        return res.status(422).json({ message: "Invalid userId." });
      }
      if (typeof points !== "number" || points < 0 || points > 100 || !Number.isInteger(points)) {
        return res.status(422).json({ message: "Points must be an integer between 0 and 100." });
      }

      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const isMember = couple.members.some(m => m.toString() === userId);
      if (!isMember) {
        logger.security("Score manipulation attempt", {
          ip: req.ip, userId: req.user._id, target: userId, coupleId: req.params.coupleId,
        });
        return res.status(403).json({ message: "User is not a couple member." });
      }

      const current = couple.scores.get(userId) || 0;
      couple.scores.set(userId, current + points);
      await couple.save();

      res.json({ scores: Object.fromEntries(couple.scores) });
    } catch (err) {
      logger.error("Update score error", { error: err.message });
      res.status(500).json({ message: "Failed to update score." });
    }
  }
);

// ── PATCH /api/couples/:coupleId/ideas/fav ─────────────────────────────────
router.patch("/:coupleId/ideas/fav",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { ideaId } = req.body;
      if (!ideaId || typeof ideaId !== "string") {
        return res.status(422).json({ message: "Invalid ideaId." });
      }
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const idx = couple.ideaFavs.indexOf(ideaId);
      if (idx === -1) couple.ideaFavs.push(ideaId);
      else            couple.ideaFavs.splice(idx, 1);

      await couple.save();
      res.json({ ideaFavs: couple.ideaFavs });
    } catch (err) {
      logger.error("Toggle idea fav error", { error: err.message });
      res.status(500).json({ message: "Failed to update." });
    }
  }
);

// ── PATCH /api/couples/:coupleId/ideas/done ────────────────────────────────
router.patch("/:coupleId/ideas/done",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { ideaId } = req.body;
      if (!ideaId || typeof ideaId !== "string") {
        return res.status(422).json({ message: "Invalid ideaId." });
      }
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      if (!couple.ideaDone.includes(ideaId)) {
        couple.ideaDone.push(ideaId);
        await couple.save();
      }
      res.json({ ideaDone: couple.ideaDone });
    } catch (err) {
      logger.error("Toggle idea done error", { error: err.message });
      res.status(500).json({ message: "Failed to update." });
    }
  }
);

// ── DELETE /api/couples/:coupleId ──────────────────────────────────────────
router.delete("/:coupleId",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      await User.updateMany({ _id: { $in: couple.members } }, { coupleId: null });
      await couple.deleteOne();

      audit(req, "COUPLE_DISSOLVED", { resource: `couple:${req.params.coupleId}` });
      logger.info("Couple dissolved", { coupleId: req.params.coupleId, by: req.user._id });
      res.json({ message: "Couple dissolved." });
    } catch (err) {
      logger.error("Delete couple error", { error: err.message });
      res.status(500).json({ message: "Failed to dissolve couple." });
    }
  }
);

module.exports = router;