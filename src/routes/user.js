const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { createInitialUser } = require("../seeds/createUser");
const generateToken = require("../config/generateToken");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authorizeMiddleware");
const bcrypt = require("bcryptjs");
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [user, admin, editor]
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *         age:
 *           type: number
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, editor]
 *                 default: user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *                 status:
 *                   type: string
 *       409:
 *         description: User already exists
 *       400:
 *         description: Invalid input data
 * 
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Failed to fetch users
 */
router.get("/users", protect, authorize("admin"), async (req, res) => {
	try {
		const users = await User.find({}).select("-password");
		res.status(200).send({
			count: users.length,
			users,
		});
	} catch (error) {
		res.status(500).send({
			error: "Failed to fetch users",
			details: error.message,
		});
	}
});

/**
 * @swagger
 * /v1/users/id/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user
 */
router.get("/users/id/:id", protect, authorize("admin"), async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-password");
		if (!user) {
			return res.status(404).send({ error: "User not found" });
		}
		res.status(200).send(user);
	} catch (error) {
		res.status(500).send({
			error: "Failed to fetch user",
			details: error.message
		});
	}
});

/**
 * @swagger
 * /v1/users/email/{email}:
 *   get:
 *     summary: Get user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user
 */
router.get("/users/:email", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.params.email }).select(
			"-password"
		);
		if (!user) {
			return res.status(404).send({ error: "User not found" });
		}
		res.status(200).send(user);
	} catch (error) {
		res.status(500).send({
			error: "Failed to fetch user",
			details: error.message,
		});
	}
});

/**
 * @swagger
 * /v1/users/{email}:
 *   patch:
 *     summary: Update user by email
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               age:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid updates
 *
 *   delete:
 *     summary: Delete user by email
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     age:
 *                       type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete user
 */
router.patch(
	"/users/:email",
	protect,
	authorize("admin", "editor"),
	async (req, res) => {
		const updates = Object.keys(req.body);
		const allowedUpdates = ["name", "password", "age", "status"];
		const isValidOperation = updates.every((update) =>
			allowedUpdates.includes(update)
		);

		if (!isValidOperation) {
			return res.status(400).send({
				error: "Invalid updates",
				allowedUpdates,
			});
		}

		try {
			const user = await User.findOne({ email: req.params.email });
			if (!user) {
				return res.status(404).send({ error: "User not found" });
			}

			updates.forEach((update) => (user[update] = req.body[update]));
			await user.save();

			// Return user without password
			const userResponse = user.toObject();
			delete userResponse.password;

			res.status(200).send({
				message: "User updated successfully",
				user: userResponse,
			});
		} catch (error) {
			res.status(400).send({
				error: "Failed to update user",
				details: error.message,
			});
		}
	}
);

/**
 * @swagger
 * /v1/users/initialize:
 *   post:
 *     summary: Initialize users (Development only)
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: Users initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Not available in production
 *       400:
 *         description: Failed to initialize users
 */
router.post("/users/initialize", async (req, res) => {
	try {
		if (process.env.NODE_ENV === "production") {
			return res.status(403).send({
				error: "This endpoint is not available in production",
			});
		}

		await createInitialUser();

		res.status(201).send({
			message: "Users initialized successfully",
		});
	} catch (error) {
		res.status(400).send({
			error: "Failed to initialize users",
			details: error.message,
		});
	}
});

/**
 * @swagger
 * /v1/users-approve:
 *   patch:
 *     summary: Approve or reject a user's account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - approval
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               approval:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     status:
 *                       type: string
 *       404:
 *         description: User not found
 *       400:
 *         description: Email and approval status are required
 *       500:
 *         description: Failed to process request
 */

/**
 * @swagger
 * /v1/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user123@gmail.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60b8d295f8d4bc001c8e4f9c"
 *                 name:
 *                   type: string
 *                   example: "user123"
 *                 role:
 *                   type: string
 *                   example: "user"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */

router.post("/users/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if user exists by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ error: "Invalid email or password" });
		}

		// Compare provided password with stored hashed password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ error: "Invalid email or password" });
		}

		// Generate JWT token for the user
		const token = generateToken(user._id);

		// Return user object and token (excluding password)
		res.status(200).json({
			_id: user._id,
			name: user.name,
			role: user.role,
			token,
		});
	} catch (error) {
		res.status(500).json({ error: "Server error", details: error.message });
	}
});

module.exports = router;
