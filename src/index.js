const express = require("express");
const env = require("./config/environment");
const { connectMongoDB } = require("./database/mongo");
const { createInitialUser } = require("./seeds/createUser");
const userRoutes = require("./routes/user");
const healthRoutes = require("./routes/health");
const applicationRoutes = require("./routes/application");

const app = express();

// Middleware
app.use(express.json());

// Import Swagger setup (after middleware)
require("./config/swagger")(app);

// Routes
app.use("/v1", healthRoutes);
app.use("/v1", userRoutes);
app.use("/api", applicationRoutes);

const startServer = async () => {
  try {
    await connectMongoDB();
    console.log(`Connected to MongoDB in ${env.NODE_ENV} mode`);

    // Initialize users in development
    if (env.isDevelopment()) {
      console.log("Initializing development users...");
      await createInitialUser();
    }

    // Start server
    app.listen(env.PORT, () => {
      console.log(
        `Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
