const { Sequelize } = require("sequelize");
require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = ["DB_NAME", "DB_USER", "DB_PASS", "DB_HOST"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  process.exit(1);
}

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // PostgreSQL default port
    dialect: process.env.DB_DIALECT,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      useUTC: false, // tell the driver you want to use UTC
      timezone: "+03:00", // this works for me with mariadb
      ssl: {
        require: true,
        rejectUnauthorized: false,
        // ca: fs.readFileSync('/path/to/server-ca.pem'), // Uncomment and provide path to CA certificate if required
        // cert: fs.readFileSync('/path/to/client-cert.pem'), // Uncomment if client certificate is needed
        // key: fs.readFileSync('/path/to/client-key.pem') // Uncomment if client key is needed
      },
    },
    timezone: "+03:00", // the github issue indicates the TZ here for postgres
    logging: (msg) => {
      // Check if the message is an error
      if (msg instanceof Error) {
        // Log only failed queries to console
        console.error("query failed: ", msg.original.sql);
        // This will log the failed SQL query
      }
    },
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();

    console.log("✅ Database connection established successfully.");

    // Test basic query
    const result = await sequelize.query("SELECT version();");
    console.log("📊 PostgreSQL Version:", result[0][0].version.split(" ")[0]);
  } catch (error) {
    console.log(error);
    console.error("❌ Unable to connect to database:");
    console.error("   Error:", error.message);

    // Provide helpful error messages
    if (error.code === "ECONNREFUSED") {
      console.error("   💡 Check if PostgreSQL server is running");
      console.error("   💡 Verify DB_HOST and DB_PORT in your .env file");
    } else if (error.code === "ENOTFOUND") {
      console.error("   💡 Check DB_HOST in your .env file");
    } else if (error.message.includes("password authentication failed")) {
      console.error("   💡 Check DB_USER and DB_PASSWORD in your .env file");
    } else if (
      error.message.includes("database") &&
      error.message.includes("does not exist")
    ) {
      console.error("   💡 Check DB_NAME in your .env file");
      console.error("   💡 Make sure the database exists");
    }

    throw error;
  }
};

// Close database connection
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log("✅ Database connection closed successfully.");
  } catch (error) {
    console.error("❌ Error closing database connection:", error.message);
    throw error;
  }
};

// Export the sequelize instance and helper functions
module.exports = {
  sequelize,
  testConnection,
  closeConnection,

  // Export Sequelize class for models
  Sequelize,
};
