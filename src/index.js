const express = require("express");
const env = require("./config/environment");
const { connectMongoDB } = require("./database/mongo");
const { createInitialUser } = require("./seeds/createUser");
const { createInitialApplications } = require("./seeds/createApplication");
const userRoutes = require("./routes/user");
const healthRoutes = require("./routes/health");
const applicationRoutes = require("./routes/application");
const { errorHandler, notFound } = require( "./middleware/errorMiddleware" );

const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const frontendRouter = require('./frontend/public/router/indexrouter')

// View engine setup
app.set('views', path.join(__dirname, 'frontend/views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Import Swagger setup (after middleware)
require("./config/swagger")(app);

// Routes
app.use("/v1", healthRoutes);
app.use("/v1", userRoutes);
app.use("/api", applicationRoutes);
app.use("/", frontendRouter);

app.use(errorHandler);
app.use(notFound);

const startServer = async () => {
  try {
    await connectMongoDB();
    console.log(`Connected to MongoDB in ${env.NODE_ENV} mode`);

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

console.log('Views directory:', app.get('views'));
