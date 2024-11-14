const express = require("express");
const router = express.Router();
const Application = require("../models/application");

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

module.exports = router;
