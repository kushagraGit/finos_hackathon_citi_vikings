const express = require("express");
const { connectMongoDB } = require("./config/database");
const testRoutes = require("./routes/test");
const userRoutes = require("./routes/user");

const app = express();
const port = process.env.PORT || "8080";

// Connect to MongoDB when app starts
const startServer = async () => {
  try {
    await connectMongoDB();
    console.log("Connected to MongoDB");

    // Middleware
    app.use(express.json());

    // Routes
    app.use("/v1", testRoutes);
    app.use("/v1", userRoutes);

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
