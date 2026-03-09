// server/index.js — Maximum Security
require("dotenv").config();

// ── Validate env before anything else — crash fast on misconfiguration ─────
const { validateEnv } = require("./utils/validateEnv");
validateEnv();

const express     = require("express");
const cors        = require("cors");
const helmet      = require("helmet");
const morgan      = require("morgan");
const compression = require("compression");
const session        = require("express-session");
const connectMongo   = require("connect-mongo");
const MongoStore     = connectMongo.default || connectMongo;
const passport    = require("./config/passport");
const connectDB   = require("./config/db");
const logger      = require("./utils/logger");
const requestId   = require("./middlewares/requestId");

const { globalLimiter }  = require("./middlewares/rateLimiter");
const { noSQLSanitize, xssSanitize, hppProtect, depthGuard } = require("./middlewares/sanitize");
const { suspiciousActivity } = require("./middlewares/auth");

const authRoutes   = require("./routes/auth");
const inviteRoutes = require("./routes/invites");
const coupleRoutes = require("./routes/couples");

const app    = express();
const PORT   = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

connectDB();

if (isProd) app.set("trust proxy", 1);

// ── Request ID — first so every log line gets tagged ──────────────────────
app.use(requestId);

// ── Helmet ────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", "data:", "https://lh3.googleusercontent.com"],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'"],
      objectSrc:   ["'none'"],
      mediaSrc:    ["'self'"],
      frameSrc:    ["'none'"],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff:    true,
  xssFilter:  true,
  frameguard: { action: "deny" },
  permittedCrossDomainPolicies: false,
}));

// Remove any remaining fingerprint headers
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin && !isProd) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    logger.security("CORS blocked", { origin });
    cb(new Error("CORS: origin not allowed"));
  },
  credentials:    true,
  methods:        ["GET","POST","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Request-Id"],
  exposedHeaders: ["X-Request-Id","RateLimit-Limit","RateLimit-Remaining","Retry-After"],
  maxAge:         600,
}));

// ── Body size limits — per-route, not a global catch-all ─────────────────
// Image routes get 8mb; everything else 50kb — stops payload-based attacks
app.use((req, res, next) => {
  const isImageRoute =
    (req.method === "PATCH" && /\/dates\/[A-Z]$/.test(req.path)) ||
    (req.method === "POST"  && req.path.endsWith("/memories"))     ||
    (req.method === "PATCH" && /\/memories\//.test(req.path));
  express.json({ limit: isImageRoute ? "8mb" : "50kb" })(req, res, next);
});
app.use(express.urlencoded({ extended: false, limit: "50kb" }));

// ── Security middlewares chain — ORDER MATTERS ─────────────────────────────
app.use(suspiciousActivity); // Block scanners/injections before any parsing
app.use(noSQLSanitize);      // Strip $ operators
app.use(xssSanitize);        // Strip XSS
app.use(hppProtect);         // HTTP param pollution
app.use(depthGuard);         // JSON depth bomb
app.use(globalLimiter);      // IP rate limit

app.use(compression());

// ── Logging — include requestId in every access log line ─────────────────
app.use(morgan(isProd ? "combined" : "dev", {
  stream: {
    write: (msg) => logger.info(msg.trim()),
  },
  skip: (req) => req.path === "/api/health",
}));

// ── Session ───────────────────────────────────────────────────────────────
app.use(session({
  name:              "az.sid",
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:   process.env.MONGODB_URI,
    ttl:        10 * 60,
    autoRemove: "native",
    crypto:     { secret: process.env.SESSION_SECRET },
  }),
  cookie: {
    secure:   isProd,
    httpOnly: true,
    sameSite: isProd ? "strict" : "lax",
    maxAge:   10 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/couples", coupleRoutes);

// ── Health — no info leak ─────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ── 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: "Not found." }));

// ── Error handler ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  logger.error("Unhandled error", {
    message: err.message, status,
    path: req.path, method: req.method,
    ip: req.ip, requestId: req.requestId,
    stack: err.stack,
  });
  res.status(status).json({
    message: isProd
      ? (status < 500 ? err.message : "Internal server error.")
      : err.message,
    ...(isProd ? {} : { stack: err.stack }),
    requestId: req.requestId, // Always include so user can report it
  });
});

// ── Process hardening ─────────────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason: String(reason) });
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception — shutting down", { error: err.message });
  process.exit(1);
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, { env: process.env.NODE_ENV });
});