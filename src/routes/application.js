const express = require("express");
const router = express.Router();
const Application = require("../models/application");
const { createInitialApplications } = require("../seeds/createApplication");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authorizeMiddleware");
const dbOrchestrator = require("../db/DatabaseOrchestrator");

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
router.post(
  "/v2/apps",
  protect,
  authorize("user", "admin", "editor"),
  async (req, res) => {
    try {
      await dbOrchestrator.startTransaction();
      try {
        // Check if application exists
        const existingApp = await dbOrchestrator.findOne("Application", {
          appId: req.body.appId,
        });

        if (existingApp) {
          await dbOrchestrator.abortTransaction();
          return res.status(409).json({
            message: "Application with this ID already exists",
          });
        }

        // Create new Application instance for validation
        const application = new Application(req.body);
        const savedApp = await dbOrchestrator.create(
          "Application",
          application.toObject()
        );

        await dbOrchestrator.commitTransaction();
        res.status(201).json(savedApp);
      } catch (error) {
        await dbOrchestrator.abortTransaction();
        throw error;
      }
    } catch (err) {
      res.status(400).json({
        message: "Invalid input data",
        error: err.message,
      });
    }
  }
);

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
router.get("/v2/apps", protect, async (req, res) => {
  try {
    const apps = await dbOrchestrator.find("Application", {});
    res.status(200).json({
      count: apps.length,
      applications: apps.map((app) => new Application(app).toJSON()),
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
router.get("/v2/apps/:appId", protect, async (req, res) => {
  try {
    const app = await dbOrchestrator.findOne("Application", {
      appId: req.params.appId,
    });

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json(new Application(app).toJSON());
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
router.patch(
  "/v2/apps/:appId",
  protect,
  authorize("admin", "editor"),
  async (req, res) => {
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
        "intents",
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

      await dbOrchestrator.startTransaction();
      try {
        const app = await dbOrchestrator.findOne("Application", {
          appId: req.params.appId,
        });

        if (!app) {
          await dbOrchestrator.abortTransaction();
          return res.status(404).json({ error: "Application not found" });
        }

        const updatedApp = new Application(app);
        updates.forEach((update) => (updatedApp[update] = req.body[update]));

        const savedApp = await dbOrchestrator.findOneAndUpdate(
          "Application",
          { appId: req.params.appId },
          updatedApp.toObject(),
          { new: true }
        );

        await dbOrchestrator.commitTransaction();
        res.status(200).json({
          message: "Application updated successfully",
          application: savedApp,
        });
      } catch (error) {
        await dbOrchestrator.abortTransaction();
        throw error;
      }
    } catch (err) {
      res.status(400).json({
        error: "Failed to update application",
        details: err.message,
      });
    }
  }
);

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
router.delete(
  "/v2/apps/:appId",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      await dbOrchestrator.startTransaction();
      try {
        const app = await dbOrchestrator.findOneAndDelete("Application", {
          appId: req.params.appId,
        });

        if (!app) {
          await dbOrchestrator.abortTransaction();
          return res.status(404).json({ error: "Application not found" });
        }

        await dbOrchestrator.commitTransaction();
        res.status(200).json({
          message: "Application deleted successfully",
          application: app,
        });
      } catch (error) {
        await dbOrchestrator.abortTransaction();
        throw error;
      }
    } catch (err) {
      res.status(500).json({
        error: "Failed to delete application",
        details: err.message,
      });
    }
  }
);

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
router.post("/v2/apps/search", protect, async (req, res) => {
  try {
    const { appId, version, title, description, categories } = req.body;
    const searchQueries = [];
    const validationWarnings = [];

    // Validate and build query for appId
    if (appId !== undefined) {
      if (typeof appId === "string" && appId.trim().length > 0) {
        searchQueries.push({
          appId: { $regex: appId.trim(), $options: "i" },
        });
      } else {
        validationWarnings.push(
          "Invalid appId provided - ignoring this criteria"
        );
      }
    }

    // Validate and build query for version
    if (version !== undefined) {
      if (typeof version === "string" && version.trim().length > 0) {
        searchQueries.push({
          version: {
            $regex: version.trim().replace(/\./g, "\\."),
            $options: "i",
          },
        });
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
        searchQueries.push({
          title: { $regex: title.trim(), $options: "i" },
        });
      } else {
        validationWarnings.push(
          "Invalid title provided - ignoring this criteria"
        );
      }
    }

    // Validate and build query for description
    if (description !== undefined) {
      if (typeof description === "string" && description.trim().length > 0) {
        searchQueries.push({
          description: { $regex: description.trim(), $options: "i" },
        });
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
          .map((cat) => new RegExp(cat.trim(), "i"));

        if (validCategories.length > 0) {
          searchQueries.push({
            categories: { $in: validCategories },
          });
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
    if (searchQueries.length === 0) {
      return res.status(400).json({
        error: "No valid search criteria provided",
        details: "Please provide at least one valid search parameter",
        validationWarnings,
      });
    }

    // Execute the query using dbOrchestrator with $or operator
    const query = { $or: searchQueries };
    const apps = await dbOrchestrator.find("Application", query);

    // Remove duplicates based on appId if needed
    const uniqueApps = Array.from(
      new Map(apps.map((app) => [app.appId, app])).values()
    );

    res.status(200).json({
      message: "Search completed successfully",
      count: uniqueApps.length,
      applications: uniqueApps.map((app) => new Application(app).toJSON()),
      ...(validationWarnings.length > 0 && { warnings: validationWarnings }),
      searchCriteria: {
        appId,
        version,
        title,
        description,
        categories,
      },
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
router.post(
  "/v2/apps/initialize",
  protect,
  authorize("user", "admin", "editor", "appDConsumer"),
  async (req, res) => {
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
  }
);

// Add a new endpoint to search by specific intent
router.get(
  "/v2/apps/intents/:intentName",
  protect,
  authorize("user", "admin", "editor", "appDConsumer"),
  async (req, res) => {
    try {
      const { intentName } = req.params;
      const { contexts } = req.query;

      const query = {
        "intents.name": { $regex: intentName, $options: "i" },
      };

      if (contexts) {
        const contextList = contexts.split(",").map((c) => c.trim());
        if (contextList.length > 0) {
          query["intents.contexts"] = { $in: contextList };
        }
      }

      const apps = await dbOrchestrator.find("Application", query);

      res.status(200).json({
        message: "Search completed successfully",
        count: apps.length,
        applications: apps.map((app) => new Application(app).toJSON()),
      });
    } catch (err) {
      res.status(500).json({
        error: "Failed to search applications by intent",
        details: err.message,
      });
    }
  }
);

/**
 * @swagger
 * /v1/applications/approve:
 * patch:
 * summary: Approve or reject an application
 * tags: [Applications]
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         properties:
 *           appId:
 *             type: string
 *             required: true
 *           approval:
 *             type: string
 *             enum: [accepted, rejected]
 *             required: true
 * responses:
 *   200:
 *     description: Application status updated successfully
 *   404:
 *     description: Application not found
 */
router.patch(
  "/applications/approve",
  protect,
  authorize("admin"),
  async (req, res) => {
    const { appId, approval } = req.body;

    if (!appId || !approval) {
      return res
        .status(400)
        .send({ error: "appId and approval status are required" });
    }

    try {
      await dbOrchestrator.startTransaction();
      try {
        const application = await dbOrchestrator.findOne("Application", {
          appId,
        });

        if (!application) {
          await dbOrchestrator.abortTransaction();
          return res.status(404).send({ error: "Application not found" });
        }

        if (approval === "accepted") {
          const updatedApp = await dbOrchestrator.findOneAndUpdate(
            "Application",
            { appId },
            { status: "active" },
            { new: true }
          );

          await dbOrchestrator.commitTransaction();
          return res.status(200).send({
            message: "Application approved and activated successfully",
            application: {
              appId: updatedApp.appId,
              title: updatedApp.title,
              status: updatedApp.status,
            },
          });
        } else if (approval === "rejected") {
          const deletedApp = await dbOrchestrator.findOneAndDelete(
            "Application",
            { appId }
          );

          await dbOrchestrator.commitTransaction();
          return res.status(200).send({
            message: "Application rejected and deleted successfully",
            application: { appId, title: deletedApp.title },
          });
        } else {
          await dbOrchestrator.abortTransaction();
          return res.status(400).send({ error: "Invalid approval value" });
        }
      } catch (error) {
        await dbOrchestrator.abortTransaction();
        throw error;
      }
    } catch (error) {
      return res.status(500).send({
        error: "Failed to process request",
        details: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/apps/{appId}/versions:
 *   get:
 *     summary: Get all versions of a specific application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     responses:
 *       200:
 *         description: List of application versions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Versions retrieved successfully"
 *                 appId:
 *                   type: string
 *                   example: "fdc3-workbench"
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 versions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *       404:
 *         description: No versions found for the application
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No versions found for this application"
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
router.get("/v2/apps/:appId/versions", protect, async (req, res) => {
  try {
    const { appId } = req.params;

    // Find all applications with the given appId
    const applications = await Application.find({ appId }).sort({
      version: -1,
    }); // Sort by version in descending order

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        error: "No versions found for this application",
      });
    }

    // Extract basic info from the latest version
    const latestVersion = applications[0];
    const basicInfo = {
      appId: latestVersion.appId,
      title: latestVersion.title,
      publisher: latestVersion.publisher,
      description: latestVersion.description,
    };

    res.status(200).json({
      message: "Versions retrieved successfully",
      ...basicInfo,
      count: applications.length,
      versions: applications.map((app) => ({
        version: app.version,
        status: app.status,
        updatedAt: app.updatedAt,
        createdAt: app.createdAt,
        _id: app._id,
      })),
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch application versions",
      details: err.message,
    });
  }
});
module.exports = router;
