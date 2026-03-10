// server/index.js — Maximum Security
require("dotenv").config();

// ── Validate env before anything else — crash fast on misconfiguration ─────
const { validateEnv } = require("./utils/validateEnv");
validateEnv();

const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
const compression  = require("compression");
const session      = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore   = connectMongo.default || connectMongo;
const passport     = require("./config/passport");
const connectDB    = require("./config/db");
const logger       = require("./utils/logger");
const requestId    = require("./middlewares/requestId");

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

// Remove fingerprint headers
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────
// FIX 1: fallback to empty string to avoid crash if both vars missing
// FIX 2: strip trailing slashes so "https://app.netlify.app/" matches
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map(o => o.trim().replace(/\/$/, ""));

logger.info("CORS allowed origins", { origins: allowedOrigins });

app.use(cors({
  origin: (origin, cb) => {
    // FIX 3: always allow no-origin requests (OAuth redirects have no origin header)
    if (!origin) return cb(null, true);
    // Strip trailing slash from incoming origin before comparing
    const normOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(normOrigin)) return cb(null, true);
    logger.security("CORS blocked", { origin, allowedOrigins });
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials:    true,
  methods:        ["GET","POST","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Request-Id"],
  exposedHeaders: ["X-Request-Id","RateLimit-Limit","RateLimit-Remaining","Retry-After"],
  maxAge:         600,
}));

// ── Body size limits ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  const isImageRoute =
    (req.method === "PATCH" && /\/dates\/[A-Z]$/.test(req.path)) ||
    (req.method === "POST"  && req.path.endsWith("/memories"))    ||
    (req.method === "PATCH" && /\/memories\//.test(req.path));
  express.json({ limit: isImageRoute ? "8mb" : "50kb" })(req, res, next);
});
app.use(express.urlencoded({ extended: false, limit: "50kb" }));

// ── Security middleware chain — ORDER MATTERS ─────────────────────────────
app.use(suspiciousActivity);
app.use(noSQLSanitize);
app.use(xssSanitize);
app.use(hppProtect);
app.use(depthGuard);
app.use(globalLimiter);

app.use(compression());

// ── Logging ───────────────────────────────────────────────────────────────
app.use(morgan(isProd ? "combined" : "dev", {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip:   (req) => req.path === "/api/health",
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
    sameSite: isProd ? "none" : "lax",  // FIX 4: "none" needed for cross-site OAuth in prod
    maxAge:   10 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/couples", coupleRoutes);

// ── Health ────────────────────────────────────────────────────────────────
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
    requestId: req.requestId,
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