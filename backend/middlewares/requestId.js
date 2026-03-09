// server/middleware/requestId.js
// Attaches a unique ID to every request.
// This lets you trace a single request across all log lines —
// critical when investigating an attack or bug.
const { v4: uuidv4 } = require("uuid");

const requestId = (req, res, next) => {
  // Use existing ID if forwarded from a trusted proxy/gateway, otherwise create one
  const id = req.headers["x-request-id"] || uuidv4();
  req.requestId = id;
  res.setHeader("X-Request-Id", id); // Echo back to client for debugging
  next();
};

module.exports = requestId;