const mongoose = require("mongoose");
const logger = require("../utils/logger");

// Connection options for production stability
const connectionOptions = {
  maxPoolSize: 10, // Max concurrent connections
  serverSelectionTimeoutMS: 5000, // Timeout after 5s if no server found
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI,
      connectionOptions
    );

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected successfully");
    });
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    // Exit process with failure on initial connection error
    process.exit(1);
  }
};

module.exports = connectDB;