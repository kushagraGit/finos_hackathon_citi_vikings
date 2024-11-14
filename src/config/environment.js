require("dotenv").config();

const environment = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8080,
  HOST: process.env.HOST || "localhost",
  MONGODB_URL: process.env.MONGODB_URL,

  // Helper methods
  isDevelopment: function () {
    return this.NODE_ENV === "development";
  },

  // Get base URL for the API
  getBaseUrl: function () {
    const protocol = this.isDevelopment() ? "http" : "https";
    return `${protocol}://${this.HOST}:${this.PORT}`;
  },
};

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URL"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

module.exports = environment;
