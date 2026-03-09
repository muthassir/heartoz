// server/config/db.js
const mongoose = require("mongoose");
const logger   = require("../utils/logger");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);   // Reject unknown query fields
    mongoose.set("sanitizeFilter", true); // Extra NoSQL injection protection

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:          45000,
      maxPoolSize:              10,
      minPoolSize:              2,
      // Disable the ability to run arbitrary JS in queries (mapReduce, $where etc.)
      // Note: This is enforced at MongoDB server level — set in Atlas or mongod config
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    // Graceful shutdown
    process.on("SIGINT",  () => mongoose.connection.close().then(() => process.exit(0)));
    process.on("SIGTERM", () => mongoose.connection.close().then(() => process.exit(0)));

    mongoose.connection.on("error",        (err) => logger.error("MongoDB error",        { error: err.message }));
    mongoose.connection.on("disconnected", ()    => logger.warn ("MongoDB disconnected — attempting reconnect"));
    mongoose.connection.on("reconnected",  ()    => logger.info ("MongoDB reconnected"));

  } catch (err) {
    logger.error("❌ MongoDB connection failed", { error: err.message });
    process.exit(1);
  }
};

module.exports = connectDB;