// server/utils/logger.js
const winston             = require("winston");
const DailyRotateFile     = require("winston-daily-rotate-file");
const path                = require("path");
const fs                  = require("fs");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, requestId, stack, ...meta }) => {
    const rid     = requestId ? ` [${requestId}]` : "";
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : "";
    return `[${timestamp}]${rid} ${level}: ${stack || message}${metaStr}`;
  })
);

const jsonFormat = combine(timestamp(), errors({ stack: true }), json());
const isProd     = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level:       process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "az-date-api" },
  format: isProd ? jsonFormat : combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : "";
      return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === "test",
    }),
    // All logs — 14-day rolling
    new DailyRotateFile({
      filename:      path.join(logsDir, "app-%DATE%.log"),
      datePattern:   "YYYY-MM-DD",
      maxSize:       "10m",
      maxFiles:      "14d",
      zippedArchive: true,
    }),
    // Security events — 90-day rolling (forensics)
    new DailyRotateFile({
      filename:      path.join(logsDir, "security-%DATE%.log"),
      datePattern:   "YYYY-MM-DD",
      level:         "warn",
      maxSize:       "10m",
      maxFiles:      "90d",
      zippedArchive: true,
    }),
    // Errors only — 30-day rolling
    new DailyRotateFile({
      filename:      path.join(logsDir, "error-%DATE%.log"),
      datePattern:   "YYYY-MM-DD",
      level:         "error",
      maxSize:       "10m",
      maxFiles:      "30d",
      zippedArchive: true,
    }),
  ],
});

// Structured security event
logger.security = (event, meta = {}) => logger.warn(`[SECURITY] ${event}`, meta);

// Request-scoped logger — attaches requestId to every log line
logger.withRequest = (req) => ({
  info:     (msg, meta = {}) => logger.info(msg,     { requestId: req.requestId, ...meta }),
  warn:     (msg, meta = {}) => logger.warn(msg,     { requestId: req.requestId, ...meta }),
  error:    (msg, meta = {}) => logger.error(msg,    { requestId: req.requestId, ...meta }),
  security: (msg, meta = {}) => logger.security(msg, { requestId: req.requestId, ...meta }),
});

module.exports = logger;