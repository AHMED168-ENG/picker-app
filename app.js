const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const httpModule = require("http");
require("dotenv").config();
const winston = require("winston");

// Import database configuration - استيراد صحيح
const { sequelize, testConnection } = require("./config/database");

// Import middleware
const {
  errorHandler,
  notFound,
  generalLimiter,
  corsOptions,
  securityHeaders,
} = require("./middleware/index");

// Import routes
const routes = require("./routes");

// Import socket initialization if exists
const { initSocket } = require("./config/socket"); // uncomment if you have socket setup

// Create Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(cors(corsOptions));

// Custom security headers
app.use(securityHeaders);

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(
  express.json({
    limit: "10mb",
    strict: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

global.logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    winston.format.printf(
      (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
    )
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: "uploads/error.log",
      level: "error",
      handleExceptions: true,
      json: true,
      timestamp: true,
    }),
    new winston.transports.File({ filename: "combined.log", level: "info" }),
  ],
});

// Mount API routes
app.use("/api", routes);

// Handle 404 errors
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close database connection
    if (sequelize) {
      await sequelize.close();
      console.log("✅ Database connection closed");
    }

    console.log("✅ Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

// Start server function
const startServer = async () => {
  try {
    // Test database connection
    console.log("🔄 Testing database connection...");
    await testConnection();

    // Start HTTP server
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("\n🚀 ========================================");
      console.log(`✅ Server running successfully!`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📡 Server: http://${HOST}:${PORT}`);
      console.log(`📚 API Documentation: http://${HOST}:${PORT}/api`);
      console.log("🚀 ========================================\n");
    });

    var socketServer = httpModule.createServer(app);

    initSocket(socketServer);
    socketServer.listen(process.env.SOCKET_PORT, () => {
      console.log(`Socket server running on port ${process.env.SOCKET_PORT}`);
    });

    // Handle shutdown signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("UNHANDLED_REJECTION");
    });

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}

// Export the app for testing
module.exports = app;
