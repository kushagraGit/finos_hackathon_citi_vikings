const express = require("express");
const router = express.Router();
const Application = require("../models/application");
const { createInitialApplications } = require("../seeds/createApplication");

/**
 * @swagger
 * /api/v2/apps:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Application'
 *     responses:
 *       201:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Application already exists
 */
router.post("/v2/apps", async (req, res) => {
  try {
    // Check if application already exists
    const existingApp = await Application.findOne({ appId: req.body.appId });
    if (existingApp) {
      return res
        .status(409)
        .json({ message: "Application with this ID already exists" });
    }

    const application = new Application(req.body);
    await application.save();
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ message: "Invalid input data", error: err.message });
  }
});

/**
 * @swagger
 * /api/v2/apps:
 *   get:
 *     summary: Retrieve all application definitions
 *     tags: [Applications]
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
router.get("/v2/apps", async (req, res) => {
  try {
    const apps = await Application.find();
    res.status(200).json({ applications: apps });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

/**
 * @swagger
 * /api/v2/apps/{appId}:
 *   get:
 *     summary: Retrieve an application definition by appId
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     responses:
 *       200:
 *         description: Application details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
router.get("/v2/apps/:appId", async (req, res) => {
  try {
    const app = await Application.findOne({ appId: req.params.appId });
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json(app);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

/**
 * @swagger
 * /api/v2/apps/{appId}:
 *   patch:
 *     summary: Update an application by appId
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               version:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Application updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found
 *       400:
 *         description: Invalid input data
 */
router.patch("/v2/apps/:appId", async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "title",
      "description",
      "version",
      "categories",
      "icons",
      "screenshots",
      "contactEmail",
      "supportEmail",
      "moreInfo",
      "publisher",
      "details",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    const app = await Application.findOne({ appId: req.params.appId });
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    updates.forEach((update) => (app[update] = req.body[update]));
    await app.save();

    res.status(200).json(app);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
});

/**
 * @swagger
 * /api/v2/apps/{appId}:
 *   delete:
 *     summary: Delete an application by appId
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Application not found
 */
router.delete("/v2/apps/:appId", async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({ appId: req.params.appId });
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

/**
 * @swagger
 * /api/v2/apps/initialize:
 *   post:
 *     summary: Initialize applications with sample data (Development only)
 *     tags: [Applications]
 *     responses:
 *       201:
 *         description: Applications initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: string
 *       403:
 *         description: Not available in production
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */
router.post("/v2/apps/initialize", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        error: "This endpoint is not available in production",
      });
    }

    const results = await createInitialApplications();

    res.status(201).json({
      message: "Applications initialized successfully",
      results,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to initialize applications",
      details: error.message,
    });
  }
});

module.exports = router;
