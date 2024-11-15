const express = require("express");
const router = express.Router();
const Application = require("../models/application");
const { createInitialApplications } = require("../seeds/createApplication");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authorizeMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         appId:
 *           type: string
 *           description: Unique identifier for the application
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         version:
 *           type: string
 *           pattern: ^\d+(\.\d+)*$
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         intents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parameters:
 *                 type: array
 *                 items:
 *                   type: string
 *         icons:
 *           type: array
 *           items:
 *             type: object
 *         screenshots:
 *           type: array
 *           items:
 *             type: object
 *         contactEmail:
 *           type: string
 *           format: email
 *         supportEmail:
 *           type: string
 *           format: email
 *         moreInfo:
 *           type: object
 *         publisher:
 *           type: string
 *         details:
 *           type: object
 *         status:
 *           type: string
 *           enum: [pending, active, inactive]
 */

/**
 * @swagger
 * /api/v2/apps:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
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
 * 
 *   get:
 *     summary: Retrieve all application definitions
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
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
 */

/**
 * @swagger
 * /api/v2/apps/{appId}:
 *   get:
 *     summary: Retrieve an application definition by appId
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
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
 *       500:
 *         description: Server error
 * 
 *   patch:
 *     summary: Update an application by appId
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
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
 *               icons:
 *                 type: array
 *               screenshots:
 *                 type: array
 *               contactEmail:
 *                 type: string
 *                 format: email
 *               supportEmail:
 *                 type: string
 *                 format: email
 *               moreInfo:
 *                 type: object
 *               publisher:
 *                 type: string
 *               details:
 *                 type: object
 *               intents:
 *                 type: array
 *     responses:
 *       200:
 *         description: Application updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 application:
 *                   $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found
 *       400:
 *         description: Invalid input data
 * 
 *   delete:
 *     summary: Delete an application by appId
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
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
 *                 application:
 *                   $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v2/apps/search:
 *   post:
 *     summary: Search applications based on multiple criteria
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appId:
 *                 type: string
 *                 description: Case-insensitive partial match for application ID
 *                 example: "fdc3-workbench"
 *               version:
 *                 type: string
 *                 description: Version number (supports partial match)
 *                 example: "1.0.0"
 *               title:
 *                 type: string
 *                 description: Case-insensitive partial match for title
 *                 example: "Market"
 *               description:
 *                 type: string
 *                 description: Case-insensitive partial match for description
 *                 example: "trading"
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Match any of the provided categories
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
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *                 warnings:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid search criteria
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v2/applications/approve:
 *   patch:
 *     summary: Approve or reject an application
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appId
 *               - approval
 *             properties:
 *               appId:
 *                 type: string
 *                 description: The application ID to approve/reject
 *               approval:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 description: Approval decision
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 application:
 *                   type: object
 *                   properties:
 *                     appId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */

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
	authorize("user", "admin", "editor", "desktopAgent"),
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
	authorize("user", "admin", "editor", "desktopAgent"),
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

			const apps = await Application.find(query);

			res.status(200).json({
				message: "Search completed successfully",
				count: apps.length,
				applications: apps,
			});
		} catch (err) {
			res.status(500).json({
				error: "Failed to search applications by intent",
				details: err.message,
			});
		}
	}
);

module.exports = router;
