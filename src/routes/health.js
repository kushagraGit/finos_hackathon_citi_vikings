const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Basic health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
    service: "user-service",
  });
});

// Detailed health check including DB connection
router.get("/health/detailed", async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.status(200).json({
      status: "healthy",
      timestamp: new Date(),
      uptime: process.uptime(),
      service: "user-service",
      memory: {
        usage: process.memoryUsage(),
        free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed,
      },
      database: {
        status: dbStatus[dbState],
        healthy: dbState === 1,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date(),
      error: error.message,
    });
  }
});

// Liveness probe (for Kubernetes)
router.get("/health/live", (req, res) => {
  res.status(200).json({
    status: "alive",
    timestamp: new Date(),
  });
});

// Readiness probe (for Kubernetes)
router.get("/health/ready", async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected");
    }

    res.status(200).json({
      status: "ready",
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      timestamp: new Date(),
      error: error.message,
    });
  }
});

module.exports = router;
