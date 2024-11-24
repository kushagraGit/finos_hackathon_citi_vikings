const env = require("./config/environment");
const dbOrchestrator = require("./db/DatabaseOrchestrator");
const { createInitialUser } = require("./seeds/createUser");
const { createInitialApplications } = require("./seeds/createApplication");
const Server = require("./server");

const startServer = async () => {
  try {
    // Connect to database first, then get instance
    await dbOrchestrator.initialize();
    await dbOrchestrator.connect();
    console.log(`Connected to ${env.DB_TYPE} database in ${env.NODE_ENV} mode`);

    // Initialize data in development
    if (env.isDevelopment()) {
      console.log("Initializing development data...");
      await Promise.all([
        createInitialUser().then(() => console.log("Users initialized")),
        createInitialApplications().then(() =>
          console.log("Applications initialized")
        ),
      ]);
    }

    // Initialize and start server
    const server = new Server(env);
    await server.start(env.PORT);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received: closing HTTP server");
  await dbOrchestrator.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received: closing HTTP server");
  await dbOrchestrator.disconnect();
  process.exit(0);
});

startServer();
