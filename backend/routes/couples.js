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
const { uploadBase64 } = require("../config/cloudinary");

const router = express.Router();
router.use(protect);

// ── GET /api/couples/:coupleId ─────────────────────────────────────────────
// router.get("/:coupleId",
//   validateCoupleId, handleValidation,
//   coupleGuard,
//   async (req, res) => {
//     try {
//       const couple = await Couple.findById(req.params.coupleId);
//       if (!couple) return res.status(404).json({ message: "Couple not found." });

//       // Backfill game defaults for existing couples created before this feature.
//       if (!couple.game || !couple.game.turnUserId) {
//         const firstMember = couple.members?.[0];
//         couple.game = {
//           turnUserId: firstMember ? firstMember.toString() : null,
//           pending: {
//             type: null,
//             fromUserId: null,
//             toUserId: null,
//             truthPrompt: "",
//             truthText: "",
//             darePrompt: "",
//             dareVideo: null,
//           },
//         };
//         await couple.save();
//       }

//       const partnerId = couple.members.find(id => id.toString() !== req.user._id.toString());
//       const partner   = partnerId
//         ? await User.findById(partnerId).select("name email photo").lean()
//         : null;

//       res.json({ couple: couple.toObject(), partner });
//     } catch (err) {
//       logger.error("Get couple error", { error: err.message });
//       res.status(500).json({ message: "Failed to load couple data." });
//     }
//   }
// );

router.get("/:coupleId",
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      // Backfill game defaults for existing couples created before this feature.
      if (!couple.game || !couple.game.turnUserId) {
        const firstMember = couple.members?.[0];
        couple.game = {
          turnUserId: firstMember ? firstMember.toString() : null,
          pending: {
            type: null,
            fromUserId: null,
            toUserId: null,
            truthPrompt: "",
            truthText: "",
            darePrompt: "",
            dareVideo: null,
          },
        };
        await couple.save();
      }

      const partnerId = couple.members.find(id => id.toString() !== req.user._id.toString());
      const partner   = partnerId
        ? await User.findById(partnerId).select("name email photo").lean()
        : null;

      // Convert the couple to a plain object
      const coupleObj = couple.toObject();
      
      // FIX: Convert dates Map to a plain object
      if (couple.dates && couple.dates instanceof Map) {
        const datesObj = {};
        for (const [key, value] of couple.dates.entries()) {
          datesObj[key] = {
            done: value.done || false,
            photo: value.photo || null,
            doneAt: value.doneAt || null
          };
        }
        coupleObj.dates = datesObj;
      }
      
      // Also convert scores Map (optional, but good practice)
      if (couple.scores && couple.scores instanceof Map) {
        coupleObj.scores = Object.fromEntries(couple.scores);
      }

      // Convert ticTacToe's internal Maps (symbols, roundsWon) to plain objects
      if (couple.ticTacToe) {
        coupleObj.ticTacToe = serializeTicTacToe(couple.ticTacToe);
      }

      res.json({ couple: coupleObj, partner });
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

        // Upload to Cloudinary and store URL instead of raw base64
        if (photo) {
          try {
            photo = await uploadBase64(photo, { resource_type: "image" });
          } catch (uploadErr) {
            logger.error("Cloudinary date photo upload error", { error: uploadErr.message });
            return res.status(500).json({ message: "Failed to upload photo. Please try again." });
          }
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

      const { title, date, note, tag, mood } = req.body;
      let { imageUrl } = req.body;

      // Upload memory image to Cloudinary if provided
      if (imageUrl) {
        try {
          imageUrl = await uploadBase64(imageUrl, { resource_type: "image" });
        } catch (uploadErr) {
          logger.error("Cloudinary memory image upload error", { error: uploadErr.message });
          return res.status(500).json({ message: "Failed to upload image. Please try again." });
        }
      }

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

      // Upload new image to Cloudinary if it's a base64 string
      if (req.body.imageUrl && req.body.imageUrl.startsWith("data:image/")) {
        try {
          req.body.imageUrl = await uploadBase64(req.body.imageUrl, { resource_type: "image" });
        } catch (uploadErr) {
          logger.error("Cloudinary memory image update error", { error: uploadErr.message });
          return res.status(500).json({ message: "Failed to upload image. Please try again." });
        }
      }

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

// ── Game: Truth submit ────────────────────────────────────────────────────
router.post("/:coupleId/games/truth",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { truthPrompt, text } = req.body || {};
      if (typeof truthPrompt !== "string" || !truthPrompt.trim()) {
        return res.status(422).json({ message: "truthPrompt is required." });
      }
      if (typeof text !== "string" || !text.trim()) {
        return res.status(422).json({ message: "Truth text is required." });
      }
      if (text.length > 5000) {
        return res.status(422).json({ message: "Truth text too long." });
      }

      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      // Init game state if missing (defensive for older DB rows).
      if (!couple.game) {
        const firstMember = couple.members?.[0];
        couple.game = {
          turnUserId: firstMember ? firstMember.toString() : null,
          pending: { type: null, fromUserId: null, toUserId: null, truthPrompt: "", truthText: "", darePrompt: "", dareVideo: null },
        };
      }
      if (couple.game.pending?.type) {
        return res.status(409).json({ message: "A game submission is already pending." });
      }

      const senderId = req.user._id.toString();
      if (couple.game.turnUserId !== senderId) {
        return res.status(403).json({ message: "Not your turn." });
      }

      const toUserIdObj = couple.members.find(id => id.toString() !== senderId);
      const toUserId = toUserIdObj ? toUserIdObj.toString() : null;
      if (!toUserId) return res.status(403).json({ message: "Partner not found." });

      couple.game.pending = {
        type: "truth",
        fromUserId: senderId,
        toUserId,
        truthPrompt: truthPrompt.trim(),
        truthText: text.trim(),
        darePrompt: "",
        dareVideo: null,
      };
      couple.game.turnUserId = toUserId; // receiver reviews next

      await couple.save();
      res.json({ game: couple.game, scores: Object.fromEntries(couple.scores) });
    } catch (err) {
      logger.error("Game truth submit error", { error: err.message });
      res.status(500).json({ message: "Failed to submit truth." });
    }
  }
);

// ── Game: Dare submit (video) ─────────────────────────────────────────────
router.post("/:coupleId/games/dare",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { darePrompt, video } = req.body || {};
      if (typeof darePrompt !== "string" || !darePrompt.trim()) {
        return res.status(422).json({ message: "darePrompt is required." });
      }
      if (typeof video !== "string" || !video.trim()) {
        return res.status(422).json({ message: "video is required." });
      }

      // Approximate size guard for base64 strings.
      const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20MB
      if (Buffer.byteLength(video, "utf8") > MAX_VIDEO_BYTES) {
        return res.status(422).json({ message: "Video too large (max 20MB)." });
      }
      if (!video.startsWith("data:video/") || !video.includes(";base64,")) {
        return res.status(422).json({ message: "Invalid video format. Send as data URI base64." });
      }

      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      if (!couple.game) {
        const firstMember = couple.members?.[0];
        couple.game = {
          turnUserId: firstMember ? firstMember.toString() : null,
          pending: { type: null, fromUserId: null, toUserId: null, truthPrompt: "", truthText: "", darePrompt: "", dareVideo: null },
        };
      }
      if (couple.game.pending?.type) {
        return res.status(409).json({ message: "A game submission is already pending." });
      }

      const senderId = req.user._id.toString();
      if (couple.game.turnUserId !== senderId) {
        return res.status(403).json({ message: "Not your turn." });
      }

      const toUserIdObj = couple.members.find(id => id.toString() !== senderId);
      const toUserId = toUserIdObj ? toUserIdObj.toString() : null;
      if (!toUserId) return res.status(403).json({ message: "Partner not found." });

      // Upload video to Cloudinary and store URL instead of raw base64
      let videoUrl;
      try {
        videoUrl = await uploadBase64(video, {
          resource_type: "video",
          eager: [{ format: "mp4", quality: "auto" }],
        });
      } catch (uploadErr) {
        logger.error("Cloudinary dare video upload error", { error: uploadErr.message });
        return res.status(500).json({ message: "Failed to upload video. Please try again." });
      }

      couple.game.pending = {
        type: "dare",
        fromUserId: senderId,
        toUserId,
        truthPrompt: "",
        truthText: "",
        darePrompt: darePrompt.trim(),
        dareVideo: videoUrl, // Cloudinary URL — not raw base64
      };
      couple.game.turnUserId = toUserId; // receiver reviews next

      await couple.save();
      res.json({ game: couple.game, scores: Object.fromEntries(couple.scores) });
    } catch (err) {
      logger.error("Game dare submit error", { error: err.message });
      res.status(500).json({ message: "Failed to submit dare video." });
    }
  }
);

// ── Game: Receiver review (done / skip) ───────────────────────────────────
router.post("/:coupleId/games/review",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { decision } = req.body || {};
      if (!["done", "skip"].includes(decision)) {
        return res.status(422).json({ message: "decision must be 'done' or 'skip'." });
      }

      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      if (!couple.game) {
        return res.status(409).json({ message: "No game state." });
      }
      const pending = couple.game.pending || {};
      if (!pending.type || !pending.fromUserId || !pending.toUserId) {
        return res.status(409).json({ message: "No pending submission to review." });
      }

      const reviewerId = req.user._id.toString();
      if (pending.toUserId !== reviewerId) {
        return res.status(403).json({ message: "Not your review turn." });
      }

      const senderId = pending.fromUserId;

      const fullPoints  = pending.type === "truth" ? 10 : 20;
      const skipPoints  = pending.type === "truth" ? 5  : 10;
      const addPoints   = decision === "done" ? fullPoints : skipPoints;

      const current = couple.scores.get(senderId) || 0;
      couple.scores.set(senderId, current + addPoints);

      // Reset pending & decide next turn
      couple.game.pending = {
        type: null,
        fromUserId: null,
        toUserId: null,
        truthPrompt: "",
        truthText: "",
        darePrompt: "",
        dareVideo: null,
      };

      // done -> receiver gets next turn
      // skip -> sender gets next turn (receiver skipped their turn)
      couple.game.turnUserId = decision === "done" ? reviewerId : senderId;

      await couple.save();
      res.json({ game: couple.game, scores: Object.fromEntries(couple.scores) });
    } catch (err) {
      logger.error("Game review error", { error: err.message });
      res.status(500).json({ message: "Failed to review submission." });
    }
  }
);

// ── Helpers for the Bet Game (Tic-Tac-Toe) ─────────────────────────────────
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

const checkWinner = (board) => {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]; // "X" | "O"
  }
  if (board.every(c => c)) return "draw";
  return null;
};

const emptyTicTacToe = () => ({
  board: Array(9).fill(null),
  turnUserId: null,
  status: "idle",
  winnerUserId: null,
  symbols: {},
  stake: { text: "", fromUserId: null, toUserId: null, status: "none" },
  roundsWon: {},
});

// Mongoose Map subfields don't auto-flatten on res.json — convert manually.
const serializeTicTacToe = (ticTacToe) => {
  if (!ticTacToe) return emptyTicTacToe();
  const obj = typeof ticTacToe.toObject === "function" ? ticTacToe.toObject() : ticTacToe;
  return {
    ...obj,
    symbols:   obj.symbols   instanceof Map ? Object.fromEntries(obj.symbols)   : (obj.symbols || {}),
    roundsWon: obj.roundsWon instanceof Map ? Object.fromEntries(obj.roundsWon) : (obj.roundsWon || {}),
  };
};

// ── Bet Game: start / restart a round ──────────────────────────────────────
router.post("/:coupleId/games/tictactoe/start",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const existing = couple.ticTacToe ? couple.ticTacToe.toObject() : null;
      // Only block if a game is actively being played — allow restart from stuck stake states
      if (existing && existing.status === "playing") {
        return res.status(409).json({ message: "A round is already in progress." });
      }

      const starterId = req.user._id.toString();
      const members = couple.members.map(m => m.toString());
      const otherId = members.find(id => id !== starterId);
      if (!otherId) return res.status(403).json({ message: "Partner not found." });

      const prevRounds  = existing?.roundsWon || {};
      const prevHistory = existing?.history   || [];

      couple.ticTacToe = {
        board: Array(9).fill(null),
        turnUserId: starterId,
        status: "playing",
        winnerUserId: null,
        symbols: { [starterId]: "X", [otherId]: "O" },
        stake: { text: "", fromUserId: null, toUserId: null, status: "none" },
        roundsWon: prevRounds,
        history: prevHistory,
      };

      couple.markModified('ticTacToe');
      await couple.save();
      res.json({ ticTacToe: serializeTicTacToe(couple.ticTacToe) });
    } catch (err) {
      logger.error("Bet game start error", { error: err.message });
      res.status(500).json({ message: "Failed to start round." });
    }
  }
);

// ── Bet Game: make a move ──────────────────────────────────────────────────
router.post("/:coupleId/games/tictactoe/move",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { index } = req.body || {};
      if (!Number.isInteger(index) || index < 0 || index > 8) {
        return res.status(422).json({ message: "Invalid cell index." });
      }

      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const game = couple.ticTacToe;
      if (!game || game.status !== "playing") {
        return res.status(409).json({ message: "No round in progress." });
      }

      const playerId = req.user._id.toString();
      if (game.turnUserId !== playerId) {
        return res.status(403).json({ message: "Not your turn." });
      }

      const board = [...game.board];
      if (board[index]) {
        return res.status(409).json({ message: "Cell already taken." });
      }

      const mySymbol = game.symbols.get(playerId);
      board[index] = mySymbol;
      couple.ticTacToe.board = board;

      const result = checkWinner(board);
      const otherId = couple.members.map(m => m.toString()).find(id => id !== playerId);

      if (result === "draw") {
        couple.ticTacToe.status = "draw";
        couple.ticTacToe.turnUserId = null;
      } else if (result === mySymbol) {
        couple.ticTacToe.status = "awaiting_stake";
        couple.ticTacToe.winnerUserId = playerId;
        couple.ticTacToe.turnUserId = playerId; // winner sets the stake next
        const current = couple.ticTacToe.roundsWon.get(playerId) || 0;
        couple.ticTacToe.roundsWon.set(playerId, current + 1);
      } else {
        couple.ticTacToe.turnUserId = otherId;
      }

      couple.markModified('ticTacToe');
      await couple.save();
      res.json({ ticTacToe: serializeTicTacToe(couple.ticTacToe) });
    } catch (err) {
      logger.error("Bet game move error", { error: err.message });
      res.status(500).json({ message: "Failed to play move." });
    }
  }
);

// ── Bet Game: winner sets the stake ("buy me this", custom dare, etc.) ─────
router.post("/:coupleId/games/tictactoe/stake",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { text } = req.body || {};
      if (typeof text !== "string" || !text.trim()) {
        return res.status(422).json({ message: "Stake text is required." });
      }
      if (text.length > 300) {
        return res.status(422).json({ message: "Stake text too long (max 300 chars)." });
      }

      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const game = couple.ticTacToe;
      if (!game || game.status !== "awaiting_stake") {
        return res.status(409).json({ message: "No stake to set right now." });
      }

      const winnerId = req.user._id.toString();
      if (game.winnerUserId !== winnerId) {
        return res.status(403).json({ message: "Only the winner can set the stake." });
      }

      const loserId = couple.members.map(m => m.toString()).find(id => id !== winnerId);

      couple.ticTacToe.stake = {
        text: text.trim(),
        fromUserId: winnerId,
        toUserId: loserId,
        status: "pending",
      };
      couple.ticTacToe.status = "stake_set";
      couple.ticTacToe.turnUserId = loserId; // loser reviews next

      couple.markModified('ticTacToe');
      await couple.save();
      res.json({ ticTacToe: serializeTicTacToe(couple.ticTacToe) });
    } catch (err) {
      logger.error("Bet game stake error", { error: err.message });
      res.status(500).json({ message: "Failed to set stake." });
    }
  }
);

// ── Bet Game: loser responds to the stake (done / decline) ─────────────────
router.post("/:coupleId/games/tictactoe/stake/review",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { decision } = req.body || {};
      if (!["done", "decline"].includes(decision)) {
        return res.status(422).json({ message: "decision must be 'done' or 'decline'." });
      }

      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      const game = couple.ticTacToe;
      if (!game || game.status !== "stake_set" || game.stake?.status !== "pending") {
        return res.status(409).json({ message: "No pending stake to review." });
      }

      const reviewerId = req.user._id.toString();
      if (game.stake.toUserId !== reviewerId) {
        return res.status(403).json({ message: "Not your stake to review." });
      }

      couple.ticTacToe.stake.status = decision === "done" ? "done" : "declined";

      // Bonus points for fulfilling the stake
      if (decision === "done") {
        const winnerId = game.stake.fromUserId;
        if (couple.scores && typeof couple.scores.get === "function") {
          const current = couple.scores.get(winnerId) || 0;
          couple.scores.set(winnerId, current + 15);
        }
      }

      // Log this settled stake to history (most recent first), keep last 50.
      // Guard: old documents may not have the history array yet.
      if (!Array.isArray(couple.ticTacToe.history)) {
        couple.ticTacToe.history = [];
      }
      couple.ticTacToe.history.unshift({
        text:        game.stake.text,
        fromUserId:  game.stake.fromUserId,
        toUserId:    game.stake.toUserId,
        status:      decision === "done" ? "done" : "declined",
        completedAt: new Date(),
      });
      if (couple.ticTacToe.history.length > 50) {
        couple.ticTacToe.history = couple.ticTacToe.history.slice(0, 50);
      }

      // Reset board to idle so either player can start a fresh round.
      couple.ticTacToe.board = Array(9).fill(null);
      couple.ticTacToe.status = "idle";
      couple.ticTacToe.winnerUserId = null;
      couple.ticTacToe.turnUserId = null;

      couple.markModified('ticTacToe');
      couple.markModified('scores');
      await couple.save();
      res.json({ ticTacToe: serializeTicTacToe(couple.ticTacToe), scores: Object.fromEntries(couple.scores) });
    } catch (err) {
      logger.error("Bet game stake review error", { error: err.message });
      res.status(500).json({ message: "Failed to review stake." });
    }
  }
);

// ── PATCH /api/couples/:coupleId/theme ─────────────────────────────────────
const ALLOWED_THEMES = new Set(["rose", "sunset", "ocean", "grape", "midnight", "mint"]);

router.patch("/:coupleId/theme",
  writeLimiter,
  validateCoupleId, handleValidation,
  coupleGuard,
  async (req, res) => {
    try {
      const { id, primary, secondary, tertiary } = req.body || {};
      if (!id || !ALLOWED_THEMES.has(id)) {
        return res.status(422).json({ message: "Invalid theme id." });
      }
      const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
      if (![primary, secondary, tertiary].every(c => typeof c === "string" && hex.test(c))) {
        return res.status(422).json({ message: "Invalid colour value." });
      }

      const couple = await Couple.findById(req.params.coupleId);
      if (!couple) return res.status(404).json({ message: "Couple not found." });

      couple.theme = { id, primary, secondary, tertiary };
      await couple.save();

      audit(req, "THEME_UPDATED", { resource: `couple:${couple._id}` });
      res.json({ theme: couple.theme });
    } catch (err) {
      logger.error("Update theme error", { error: err.message });
      res.status(500).json({ message: "Failed to update theme." });
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