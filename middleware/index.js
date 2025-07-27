const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error stack:", err.stack);

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0]?.path || "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      field,
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Invalid reference to related resource",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// 404 handler
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
  });
};

// Rate limiting
const createRateLimit = (
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests"
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limit
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX) || 100,
  "Too many requests from this IP, please try again later"
);

// Auth rate limit (stricter)
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  "Too many authentication attempts, please try again later"
);

// Strict rate limit for sensitive operations
const strictLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  3, // 3 attempts
  "Too many attempts for this operation, please try again later"
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:3001"];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security headers
const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
};

// Pagination helper
const pagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  req.pagination = {
    page,
    limit: Math.min(limit, 100), // Max 100 items per page
    offset,
  };

  next();
};

module.exports = {
  errorHandler,
  notFound,
  generalLimiter,
  authLimiter,
  strictLimiter,
  corsOptions,
  securityHeaders,
  pagination,
};
