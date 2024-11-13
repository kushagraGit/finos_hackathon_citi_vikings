const express = require("express");
const env = require("./config/environment");
const { connectMongoDB } = require("./database/mongo");
const { createInitialUser } = require("./seeds/createUser");
const userRoutes = require("./routes/user");
const healthRoutes = require("./routes/health");

const app = express();

const startServer = async () => {
  try {
    await connectMongoDB();
    console.log(`Connected to MongoDB in ${env.NODE_ENV} mode`);

    // Middleware
    app.use(express.json());

    // Routes
    app.use("/v1", healthRoutes);
    app.use("/v1", userRoutes);

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
