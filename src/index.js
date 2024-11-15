const express = require("express");
const env = require("./config/environment");
const dbOrchestrator = require("./db/DatabaseOrchestrator");
const userRoutes = require("./routes/user");
const healthRoutes = require("./routes/health");
const applicationRoutes = require("./routes/application");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(express.json());

// Import Swagger setup (after middleware)
require("./config/swagger")(app);

// Routes
app.use("/v1", healthRoutes);
app.use("/v1", userRoutes);
app.use("/api", applicationRoutes);

app.use(errorHandler);
app.use(notFound);

const startServer = async () => {
  try {
    // Connect to the database using the orchestrator
    const dbInstance = dbOrchestrator.getInstance();
    await dbInstance.connect();
    console.log(`Connected to ${env.DB_TYPE} database in ${env.NODE_ENV} mode`);

    // Initialize data in development
    if (env.isDevelopment()) {
      console.log("Initializing development data...");
      await Promise.all([
        createInitialUser().then(() => console.log("Users initialized")),
        // createInitialApplications().then(() =>
        //   console.log("Applications initialized")
        // ),
      ]);
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

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received: closing HTTP server");
  const dbInstance = dbOrchestrator.getInstance();
  await dbInstance.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received: closing HTTP server");
  const dbInstance = dbOrchestrator.getInstance();
  await dbInstance.disconnect();
  process.exit(0);
});

startServer();
