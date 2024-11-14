const express = require("express");
const router = express.Router();
const Application = require("../models/application");
const { createInitialApplications } = require("../seeds/createApplication");
const { protect } = require( "../middleware/authMiddleware" );

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
 *                 count:
 *                   type: integer
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
    res.status(200).json({
      count: apps.length,
      applications: apps,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch applications",
      details: err.message,
    });
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
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json(app);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch application",
      details: err.message,
    });
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
      return res.status(400).json({
        error: "Invalid updates",
        allowedUpdates,
      });
    }

    const app = await Application.findOne({ appId: req.params.appId });
    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    updates.forEach((update) => (app[update] = req.body[update]));
    await app.save();

    res.status(200).json({
      message: "Application updated successfully",
      application: app,
    });
  } catch (err) {
    res.status(400).json({
      error: "Failed to update application",
      details: err.message,
    });
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
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json({
      message: "Application deleted successfully",
      application: app,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to delete application",
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /api/v2/apps/search:
 *   post:
 *     summary: Search applications based on multiple criteria
 *     tags: [Applications]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appId:
 *                 type: string
 *                 description: Exact match for application ID (min 1 character)
 *                 example: "fdc3-workbench"
 *               version:
 *                 type: string
 *                 description: Exact match for version (format x.x.x)
 *                 example: "1.0.0"
 *               title:
 *                 type: string
 *                 description: Case-insensitive partial match for title (min 2 characters)
 *                 example: "Market"
 *               description:
 *                 type: string
 *                 description: Case-insensitive partial match for description (min 2 characters)
 *                 example: "trading"
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Match any of the provided categories (non-empty array of strings)
 *                 example: ["TRADING", "ANALYTICS"]
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of applications found
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *       400:
 *         description: Invalid search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
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
router.post("/v2/apps/search", async (req, res) => {
  try {
    const { appId, version, title, description, categories } = req.body;
    const query = {};
    const validationWarnings = [];

    // Validate and build query for appId
    if (appId !== undefined) {
      if (typeof appId === "string" && appId.trim().length > 0) {
        query.appId = { $regex: appId.trim(), $options: "i" }; // Changed to regex
      } else {
        validationWarnings.push(
          "Invalid appId provided - ignoring this criteria"
        );
      }
    }

    // Validate and build query for version
    if (version !== undefined) {
      if (typeof version === "string" && version.trim().length > 0) {
        query.version = {
          $regex: version.trim().replace(/\./g, "\\."),
          $options: "i",
        }; // Escape dots for regex
        if (!/^\d+(\.\d+)*$/.test(version.trim())) {
          validationWarnings.push(
            "Version format warning: partial match will be used"
          );
        }
      } else {
        validationWarnings.push(
          "Invalid version format - ignoring this criteria"
        );
      }
    }

    // Validate and build query for title
    if (title !== undefined) {
      if (typeof title === "string" && title.trim().length > 0) {
        // Reduced minimum length requirement
        query.title = { $regex: title.trim(), $options: "i" };
      } else {
        validationWarnings.push(
          "Invalid title provided - ignoring this criteria"
        );
      }
    }

    // Validate and build query for description
    if (description !== undefined) {
      if (typeof description === "string" && description.trim().length > 0) {
        // Reduced minimum length requirement
        query.description = { $regex: description.trim(), $options: "i" };
      } else {
        validationWarnings.push(
          "Invalid description provided - ignoring this criteria"
        );
      }
    }

    // Validate and build query for categories
    if (categories !== undefined) {
      if (Array.isArray(categories) && categories.length > 0) {
        const validCategories = categories
          .filter((cat) => typeof cat === "string" && cat.trim().length > 0)
          .map((cat) => new RegExp(cat.trim(), "i")); // Case-insensitive regex for each category

        if (validCategories.length > 0) {
          query.categories = { $in: validCategories };
        } else {
          validationWarnings.push(
            "No valid categories provided - ignoring this criteria"
          );
        }
      } else {
        validationWarnings.push(
          "Invalid categories format - ignoring this criteria"
        );
      }
    }

    // Check if any valid search criteria remain
    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        error: "No valid search criteria provided",
        details: "Please provide at least one valid search parameter",
        validationWarnings,
      });
    }

    // Execute the query in MongoDB
    const apps = await Application.find(query);

    // Return the search results with any validation warnings
    res.status(200).json({
      message: "Search completed successfully",
      count: apps.length,
      applications: apps,
      ...(validationWarnings.length > 0 && { warnings: validationWarnings }),
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to search applications",
      details: err.message,
    });
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
