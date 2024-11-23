const healthRoutes = require("./health");
const userRoutes = require("./user");
const applicationRoutes = require("./application");
const frontendRouter = require("../frontend/public/router/indexrouter");
const { errorHandler, notFound } = require("../middleware/errorMiddleware");

const configureRoutes = (app) => {
  // API Routes
  app.use("/v1", healthRoutes);
  app.use("/v1", userRoutes);
  app.use("/api", applicationRoutes);

  // Frontend Routes
  app.use("/", frontendRouter);

  // Error Handling
  app.use(errorHandler);
  app.use(notFound);
};

module.exports = configureRoutes;
